import { useGameStore } from '../store/gameStore';
import { STAFF_ROLES } from '../game/staff';
import type { StaffRole } from '../game/staff';
import { formatNumber } from '../game/production';

const ROLE_ICONS: Record<StaffRole, string> = {
  logic_engineer: '⚙️',
  designer: '🎨',
  artist: '🖼️',
  qa_tester: '🔍',
  researcher: '🔬',
};

export function StaffPanel() {
  const energy = useGameStore((s) => s.energy);
  const staff = useGameStore((s) => s.staff);
  const hireStaff = useGameStore((s) => s.hireStaff);
  const assignTask = useGameStore((s) => s.assignTask);

  return (
    <div className="staff-panel">
      <h2 className="panel-title">Team</h2>
      <p className="panel-subtitle">
        Hire specialists to boost different aspects of Monster Singularity.
      </p>

      <div className="staff-roles">
        {STAFF_ROLES.map((def) => {
          const hired = staff.members.filter((m) => m.role === def.id);
          const atCap = hired.length >= def.maxCount;
          const canAfford = energy >= def.hireCost;

          return (
            <div key={def.id} className="staff-role-card">
              <div className="staff-role-header">
                <span className="staff-role-icon">{ROLE_ICONS[def.id]}</span>
                <div>
                  <div className="staff-role-name">{def.name}</div>
                  <div className="staff-role-desc">{def.description}</div>
                </div>
                <div className="staff-role-meta">
                  <div className="staff-count">
                    {hired.length} / {def.maxCount}
                  </div>
                  <div className="staff-bonus">{def.bonusLabel}</div>
                </div>
              </div>

              <button
                className={`hire-btn ${!canAfford || atCap ? 'disabled' : ''}`}
                disabled={!canAfford || atCap}
                onClick={() => hireStaff(def.id)}
              >
                {atCap
                  ? 'Max'
                  : `Hire — ${formatNumber(def.hireCost)} ⚡`}
              </button>

              {hired.length > 0 && (
                <div className="staff-members">
                  {hired.map((member) => (
                    <div key={member.id} className="staff-member-row">
                      <span className="member-id">{def.name} #{member.id.split('_').pop()}</span>
                      <select
                        className="task-select"
                        value={member.assignedTask}
                        onChange={(e) => assignTask(member.id, e.target.value)}
                      >
                        {def.tasks.map((task) => (
                          <option key={task} value={task}>
                            {task}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
