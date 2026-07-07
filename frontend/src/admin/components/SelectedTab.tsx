import { useState } from 'react';
import { adminApiClient, AdminApiError, type AdminApiClientPort } from '../lib/admin-api-client';
import { useCustomerSearch, type CustomerSearchResult } from '../hooks/useCustomerSearch';
import { useToast } from '../hooks/useToast';
import { CustomerSearchBox } from './CustomerSearchBox';
import { MessageComposer } from './MessageComposer';
import { SelectedChips } from './SelectedChips';
import { Toast } from './Toast';

interface SelectedTabProps {
  token: string;
  client?: AdminApiClientPort;
}

interface SendBulkResult {
  customers_targeted: number;
  sent: number;
  failed: number;
  removed: number;
  not_found: string[];
}

export function SelectedTab({ token, client = adminApiClient }: SelectedTabProps) {
  const search = useCustomerSearch(token, client);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);
  const { toast, show } = useToast();

  const handlePick = (customer: CustomerSearchResult) => {
    setSelected((prev) => ({ ...prev, [customer.id]: customer.name }));
    search.clear();
  };

  const handleRemove = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSend = async () => {
    const customerIds = Object.keys(selected);
    if (customerIds.length === 0 || !title.trim() || !message.trim()) {
      show('error', 'Selecione ao menos um cliente e preencha título e mensagem.');
      return;
    }

    setIsSending(true);
    try {
      const data = await client.post<SendBulkResult>(
        '/push/send-bulk',
        { customer_ids: customerIds, title: title.trim(), message: message.trim(), url: url.trim() || '/' },
        token,
      );
      const notFoundMsg = data.not_found.length > 0 ? ` • ${data.not_found.length} ID(s) não encontrado(s)` : '';
      show(
        'success',
        `✅ Enviado! ${data.customers_targeted} cliente(s) • ${data.sent} enviados • ${data.failed} falhas • ${data.removed} removidos${notFoundMsg}`,
      );
    } catch (err) {
      show('error', `❌ Erro: ${err instanceof AdminApiError ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        Buscar clientes
      </label>
      <CustomerSearchBox
        term={search.term}
        onTermChange={search.setTerm}
        results={search.results}
        onPick={handlePick}
      />

      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        Selecionados ({Object.keys(selected).length})
      </label>
      <SelectedChips customers={selected} onRemove={handleRemove} />

      <MessageComposer
        title={title}
        onTitleChange={setTitle}
        titlePlaceholder="Ex: 🎁 Oferta exclusiva pra você"
        message={message}
        onMessageChange={setMessage}
        messagePlaceholder="Ex: Preparamos algo especial pros nossos melhores clientes."
        url={url}
        onUrlChange={setUrl}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-smooth"
      >
        {isSending ? 'Enviando...' : 'Enviar pros Selecionados'}
      </button>
      <Toast toast={toast} />
    </div>
  );
}
