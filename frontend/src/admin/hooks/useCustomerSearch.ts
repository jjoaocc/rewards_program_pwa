import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { adminApiClient, type AdminApiClientPort } from '../lib/admin-api-client';

export const CustomerSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export type CustomerSearchResult = z.infer<typeof CustomerSearchResultSchema>;

const DEBOUNCE_MS = 300;

interface UseCustomerSearchReturn {
  term: string;
  setTerm: (term: string) => void;
  results: CustomerSearchResult[];
  isSearching: boolean;
  clear: () => void;
}

export function useCustomerSearch(
  token: string | null,
  client: AdminApiClientPort = adminApiClient,
): UseCustomerSearchReturn {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!term || !token) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      client
        .get<unknown>(`/push/admin/customers?search=${encodeURIComponent(term)}`, token)
        .then((raw) => setResults(z.array(CustomerSearchResultSchema).parse(raw)))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term, token, client]);

  const clear = useCallback(() => setTerm(''), []);

  return { term, setTerm, results, isSearching, clear };
}
