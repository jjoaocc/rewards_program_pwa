import { useState } from 'react';
import { adminApiClient, AdminApiError, type AdminApiClientPort } from '../lib/admin-api-client';
import { useCustomerSearch, type CustomerSearchResult } from '../hooks/useCustomerSearch';
import { useToast } from '../hooks/useToast';
import { CustomerSearchBox } from './CustomerSearchBox';
import { MessageComposer } from './MessageComposer';
import { Toast } from './Toast';

interface IndividualTabProps {
  token: string;
  client?: AdminApiClientPort;
}

export function IndividualTab({ token, client = adminApiClient }: IndividualTabProps) {
  const search = useCustomerSearch(token, client);
  const [customerId, setCustomerId] = useState('');
  const [customerLabel, setCustomerLabel] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const { toast, show } = useToast();

  const handlePick = (customer: CustomerSearchResult) => {
    setCustomerId(customer.id);
    setCustomerLabel(customer.name);
    search.clear();
  };

  const handleSend = async () => {
    if (!customerId || !title.trim() || !message.trim()) {
      show('error', 'Selecione um cliente e preencha título e mensagem.');
      return;
    }

    setIsSending(true);
    try {
      const data = await client.post<{ sent: number; failed: number; removed: number }>(
        '/push/send',
        { customer_id: customerId, title: title.trim(), message: message.trim(), url: url.trim() || '/' },
        token,
      );
      show(
        'success',
        `✅ Enviado! ${data.sent} dispositivo(s) recebeu • ${data.failed} falha(s) • ${data.removed} removido(s)`,
      );
    } catch (err) {
      show('error', `❌ Erro: ${err instanceof AdminApiError ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Cliente</label>
      <CustomerSearchBox
        term={search.term}
        onTermChange={search.setTerm}
        results={search.results}
        onPick={handlePick}
      />
      {customerId && (
        <p className="text-xs text-emerald-400 mb-4">
          Selecionado: {customerLabel} ({customerId})
        </p>
      )}

      <MessageComposer
        title={title}
        onTitleChange={setTitle}
        message={message}
        onMessageChange={setMessage}
        url={url}
        onUrlChange={setUrl}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-smooth"
      >
        {isSending ? 'Enviando...' : 'Enviar Notificação'}
      </button>
      <Toast toast={toast} />
    </div>
  );
}
