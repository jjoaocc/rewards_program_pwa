interface NotificationPreviewProps {
  title: string;
  message: string;
}

export function NotificationPreview({ title, message }: NotificationPreviewProps) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Pré-visualização</p>
      <div className="flex gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
        <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center text-base shrink-0">🔔</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-100 truncate">{title || 'Título da notificação'}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {message || 'A mensagem aparece aqui conforme você digita.'}
          </p>
          <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wide">Rewards Program • agora</p>
        </div>
      </div>
    </div>
  );
}
