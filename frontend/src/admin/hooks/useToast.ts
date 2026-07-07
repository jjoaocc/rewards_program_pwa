import { useCallback, useState } from 'react';

export type ToastState = { type: 'success' | 'error'; text: string } | null;

export function useToast(autoHideMs = 5000) {
  const [toast, setToast] = useState<ToastState>(null);

  const show = useCallback(
    (type: 'success' | 'error', text: string) => {
      setToast({ type, text });
      setTimeout(() => setToast(null), autoHideMs);
    },
    [autoHideMs],
  );

  return { toast, show };
}
