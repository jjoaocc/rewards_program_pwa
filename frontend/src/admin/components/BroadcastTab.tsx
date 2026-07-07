import { useState } from 'react';
import { adminApiClient, AdminApiError, type AdminApiClientPort } from '../lib/admin-api-client';
import { useToast } from '../hooks/useToast';
import { MessageComposer } from './MessageComposer';
import { Toast } from './Toast';

interface BroadcastTabProps {
  token: string;
  client?: AdminApiClientPort;
}

interface BroadcastResult {
  customers_targeted: number;
  sent: number;
  failed: number;
  removed: number;
}

export function BroadcastTab({ token, client = adminApiClient }: BroadcastTabProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const { toast, show } = useToast();

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      show('error', 'Preencha título e mensagem.');
      return;
    }

    if (!window.confirm(`Enviar para TODOS os clientes?\n\nTítulo: ${title}\nMensagem: ${message}`)) {
      return;
    }

    setIsSending(true);
    try {
      const data = await client.post<BroadcastResult>(
        '/push/broadcast',
        { title: title.trim(), message: message.trim(), url: url.trim() || '/' },
        token,
      );
      show(
        'success',
        `✅ Broadcast concluído! ${data.customers_targeted} clientes • ${data.sent} enviados • ${data.failed} falhas • ${data.removed} removidos`,
      );
    } catch (err) {
      show('error', `❌ Erro: ${err instanceof AdminApiError ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="bg-amber-950 border border-amber-900 rounded-xl p-3 mb-5 text-sm text-amber-400">
        ⚠️ Broadcast envia para <strong>todos os clientes</strong> com notificações ativas.
      </div>

      <MessageComposer
        title={title}
        onTitleChange={setTitle}
        titlePlaceholder="Ex: 🏗️ Promoção do fim de semana!"
        message={message}
        onMessageChange={setMessage}
        messagePlaceholder="Ex: Materiais de construção com até 20% de desconto este fim de semana!"
        url={url}
        onUrlChange={setUrl}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-smooth"
      >
        {isSending ? 'Enviando...' : '📢 Enviar para Todos'}
      </button>
      <Toast toast={toast} />
    </div>
  );
}
