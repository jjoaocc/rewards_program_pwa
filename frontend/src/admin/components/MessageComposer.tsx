import { NotificationPreview } from './NotificationPreview';

interface MessageComposerProps {
  title: string;
  onTitleChange: (value: string) => void;
  titlePlaceholder?: string;
  message: string;
  onMessageChange: (value: string) => void;
  messagePlaceholder?: string;
  url: string;
  onUrlChange: (value: string) => void;
}

export function MessageComposer({
  title,
  onTitleChange,
  titlePlaceholder,
  message,
  onMessageChange,
  messagePlaceholder,
  url,
  onUrlChange,
}: MessageComposerProps) {
  return (
    <>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Título</label>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={titlePlaceholder ?? 'Ex: 🎉 Promoção especial!'}
        maxLength={80}
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Mensagem</label>
      <textarea
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder={messagePlaceholder ?? 'Ex: Você tem novidades disponíveis.'}
        maxLength={200}
        rows={3}
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        URL ao clicar (opcional)
      </label>
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="/"
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <NotificationPreview title={title} message={message} />
    </>
  );
}
