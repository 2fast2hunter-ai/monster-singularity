import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function ResearchToast() {
  const toasts = useGameStore((s) => s.researchCompletedToasts);
  const dismiss = useGameStore((s) => s.dismissResearchToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => dismiss(toasts[0]), 5000);
    return () => clearTimeout(timer);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="research-toast-container">
      {toasts.map((name) => (
        <div key={name} className="research-toast" onClick={() => dismiss(name)}>
          ✅ Research complete: <strong>{name}</strong>
        </div>
      ))}
    </div>
  );
}
