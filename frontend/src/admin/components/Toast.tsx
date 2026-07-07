import type { ToastState } from '../hooks/useToast';

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  const styles =
    toast.type === 'success'
      ? 'bg-emerald-950 border-emerald-900 text-emerald-400'
      : 'bg-rose-950 border-rose-900 text-rose-400';

  return <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold ${styles}`}>{toast.text}</div>;
}
