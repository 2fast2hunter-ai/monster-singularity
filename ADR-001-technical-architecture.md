# ADR-001: Technical Architecture and Tech Stack — Monster Singularity

**Status:** Accepted  
**Date:** 2026-05-04  
**Author:** CTO (AETERNUM)  
**Unblocks:** Core loop build (AETA-2)

---

## Context

Monster Singularity is a mobile idle/incremental game with the following technical constraints that drive architecture decisions:

- **10,000+ monster species** with genetic editor and breeding logic
- **3-year real-time progression** requiring server-authoritative timers (180-day egg incubation, weeks-long research)
- **Ecosystem simulation** (offline predation after 48h)
- **Global weekly events** (mutation auctions, Monday Dimension Storms)
- **Ad-supported daily mechanics** (time capsule streaks)
- **Alpha Entity** rendering tax at ~1,000 days playtime
- Target platforms: **iOS and Android** (mobile-first)
- Team size at start: 2–4 engineers

The architecture must be simple enough to build fast, robust enough to run for years, and extensible as the team grows.

---

## Decision 1: Mobile Game Engine — Unity

**Chosen: Unity LTS 2023.3**

### Rationale

| Criterion | Unity | Godot 4 | Custom |
|---|---|---|---|
| Mobile maturity | Excellent | Good | N/A |
| Idle/incremental ecosystem | Large (many reference projects) | Small | — |
| C# scripting | Yes | Yes (but secondary) | — |
| Asset store / plugins | Vast | Limited | — |
| iOS + Android build pipeline | Battle-tested | Improving | Months of work |
| Team hiring pool | Large | Small | Very small |
| UI system (complex genetic editor) | uGUI + UI Toolkit | Control nodes | — |

Unity is the default for mobile games for good reason. The idle game genre has extensive Unity tooling and community reference. Godot 4 is excellent but its mobile IL2CPP pipeline and plugin ecosystem lag Unity for production titles. Custom engine is a non-starter for a small studio shipping in reasonable time.

### Constraints

- Use Unity **UI Toolkit** (not legacy uGUI) for the genetic editor — it performs better at scale and is the forward-looking Unity UI system.
- **No Unity Gaming Services lock-in** for backend features (leaderboards, auth) — use our own backend so we control data and costs at scale.
- Target **IL2CPP** builds only (no Mono in production) for iOS App Store compliance and performance.

---

## Decision 2: Backend Stack — Go + PostgreSQL + Redis

**Chosen: Go 1.22 / Gin framework / PostgreSQL 16 / Redis 7**

### Rationale

**Language: Go**

- Compiled, statically typed — easier to maintain correctness over a 3-year project lifecycle
- Low memory footprint under concurrent load (many idle players sending state syncs)
- Fast startup, simple deployment (single binary in Docker)
- Strong hiring pool relative to Rust; faster iteration than Java/Spring
- Excellent libraries for HTTP (Gin), DB (pgx), scheduling (asynq over Redis)

**Primary Database: PostgreSQL 16 (Aurora-compatible)**

- ACID transactions for player state — critical for trust when timers and monetization are involved
- JSONB columns for flexible monster genome storage (avoids schema migrations for every new gene type)
- Native support for advisory locks (safe timer advancement without double-processing)
- Row-level security for future multi-tenant features

**Cache + Async Queue: Redis 7**

- Active timer tracking: store `{egg_id: expiry_timestamp}` for fast lookup without DB hits on each client poll
- Distributed locks for auction operations and Dimension Storm state transitions
- Background job queue via **asynq** (Redis-backed) for: timer expiry processing, auction settlement, ecosystem predation simulation

### Schema Strategy

```
players          — id, auth_id, created_at, dimension_level, last_seen_at
player_state     — player_id, resource_totals (JSONB), ecosystem_health, streak_days
monsters_catalog — species_id, name, stability_class, genome_template (JSONB), unlock_conditions (JSONB)
player_monsters  — id, player_id, species_id, genome (JSONB), placed_at, bio_reactor_slot
timers           — id, player_id, kind (egg|research|capsule), payload (JSONB), expires_at, resolved_at
auction_events   — id, week_start, species_id, mutation_id, winner_player_id, bid_amount, closed_at
dimension_storms — id, week_start, rule_delta (JSONB), applied_at
```

---

## Decision 3: Real-Time vs Polling — Polling-First with SSE for Auctions

**Chosen: REST polling for most features; Server-Sent Events (SSE) for live auction bidding**

### Rationale

Monster Singularity is an **idle game** — players check in, receive a state delta, and leave. True real-time (WebSocket) is engineering overhead that brings no user value for the core loop.

| Feature | Transport | Rationale |
|---|---|---|
| Player state sync | REST polling (on app foreground) | State delta on resume is sufficient |
| Timer status (eggs, research) | REST polling | Timers resolve server-side; client just reads resolved state |
| Ecosystem health | REST polling (on login) | Calculated server-side on last_seen delta |
| Dimension Storm (Monday) | Push notification + REST | Scheduled event; no per-second updates needed |
| Weekly auction bidding | **SSE (Server-Sent Events)** | Competitive bids benefit from live updates without full WS overhead |
| Auction settlement | Async queue (asynq) | Server-side, no client presence required |
| Daily time capsule | REST + Push notification | Streak check on login |

SSE is chosen over WebSocket for auctions because:
- Unidirectional (server → client) is all that's needed for live bid display
- Simpler server implementation, no upgrade handshake
- Works through most mobile proxies and load balancers without special config

**Push Notifications**: Firebase Cloud Messaging (FCM) for Android + APNs for iOS, delivered via a single abstraction layer in the backend. Used for: Dimension Storm alerts, egg hatch ready, auction closing-soon, ecosystem danger warning.

---

## Decision 4: Infrastructure Platform — AWS

**Chosen: AWS (ECS Fargate + Aurora PostgreSQL + ElastiCache Redis + S3/CloudFront)**

### Rationale

AWS is the proven platform for games at scale. GCP and Azure are viable but offer no meaningful advantage at our current stage, and AWS has the largest tooling ecosystem and hiring recognition.

### Target Architecture

```
[Mobile Client (Unity)]
        │  HTTPS
        ▼
[CloudFront CDN]
    ├── Static assets (monster art, audio) → S3
    └── API requests → Application Load Balancer
                              │
                    [ECS Fargate — Go API]
                    (auto-scaling, 2+ tasks)
                              │
              ┌───────────────┼──────────────────┐
              ▼               ▼                  ▼
    [Aurora PostgreSQL]  [ElastiCache Redis]  [SQS + Lambda]
    (player state,       (timer cache,        (async: predation
     catalog, timers)     auctions, locks)     sim, auction settle)
```

### Service Selections

| Component | Service | Reason |
|---|---|---|
| Compute | ECS Fargate | No EC2 management; scales to zero in off-peak |
| Database | Aurora PostgreSQL Serverless v2 | Auto-scales ACUs; PostgreSQL-compatible |
| Cache/Queue | ElastiCache Serverless (Redis) | Managed, HA Redis with no shard management |
| Async jobs | Amazon SQS + Go consumer on ECS | asynq or direct SQS; durable job delivery |
| Object storage | S3 | Monster art, audio, APK delta patches |
| CDN | CloudFront | Asset delivery, API edge caching for catalog |
| Push notifications | SNS → FCM/APNs | Single SNS topic fans out to both platforms |
| Secrets | AWS Secrets Manager | DB credentials, API keys |
| Monitoring | CloudWatch + structured JSON logs | Queryable logs from Go's `slog` output |

### Environment Strategy

- **dev**: Single ECS task, RDS single-AZ, no ElastiCache (use local Redis in dev)
- **staging**: Mirrors prod topology at 1/10th capacity
- **prod**: Multi-AZ Aurora, ECS auto-scaling 2–10 tasks, ElastiCache 2-node cluster

---

## Data Storage Strategy Summary

| Data Domain | Store | Access Pattern |
|---|---|---|
| Player auth | AWS Cognito (or Supabase Auth) | Login/token refresh |
| Player progression state | Aurora PostgreSQL | Read on foreground, write on action |
| Monster catalog (10k+ species) | Aurora PostgreSQL + CloudFront-cached JSON | Read-heavy, write-rare (content updates) |
| Active player monsters | Aurora PostgreSQL (JSONB genomes) | Read/write on interaction |
| Server-side timers | Aurora PostgreSQL (source of truth) + Redis (hot cache) | Redis for fast expiry lookup; Postgres for durability |
| Auction state | Aurora PostgreSQL + Redis (live bids) | Redis for in-flight auction; Postgres settles final state |
| Dimension Storm rules | Aurora PostgreSQL | Weekly write, cached aggressively |
| Assets (art, audio) | S3 + CloudFront | CDN-served, cache forever with versioned URLs |

---

## Consequences and Risks

### Accepted Trade-offs

- **Unity vendor dependency**: We accept this. Unity LTS is stable and the mobile ecosystem benefit outweighs the risk. We'll abstract engine-specific code behind interfaces to ease future migration if required.
- **AWS vendor dependency**: Acceptable. We use standard PostgreSQL and Redis interfaces — switching to RDS or self-hosted Postgres is feasible if costs dictate.
- **Go learning curve**: Most mobile game engineers write C#. Backend is a separate hire/role; Go is fast to pick up for backend engineers.

### Key Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Aurora cold start latency (Serverless v2) | Low | Use provisioned minimum ACUs (0.5) to avoid cold starts |
| Redis data loss on failover (timer cache) | Low | Aurora is source of truth; Redis miss falls back to DB query |
| Unity IL2CPP build time slows CI | Medium | Cache build artifacts in S3; use Unity Cloud Build for release builds |
| 10k species catalog migration complexity | Medium | JSONB genome field absorbs schema evolution; version field in each genome JSON |
| FCM/APNs delivery unreliability | Known | Push is best-effort; in-app inbox backs every notification server-side |

---

## Next Actions (Unblocked by This ADR)

1. **AETA-3**: Bootstrap Unity project — set up iOS/Android build targets, UI Toolkit, project folder structure
2. **AETA-4**: Bootstrap Go backend — Gin skeleton, PostgreSQL migrations (golang-migrate), Docker Compose dev environment
3. **AETA-5**: Define player state API contract (REST endpoints for sync, timer status, catalog fetch)
4. **AETA-6**: AWS account setup — IAM roles, VPC, ECS cluster, Aurora instance (dev environment)

---

*This ADR is the authoritative tech stack decision for Monster Singularity. Supersedes any informal decisions made prior to 2026-05-04. Revisit if team size exceeds 15 engineers or DAU exceeds 1M.*
