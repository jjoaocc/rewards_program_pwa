import type { CustomerSearchResult } from '../hooks/useCustomerSearch';

interface CustomerSearchBoxProps {
  placeholder?: string;
  term: string;
  onTermChange: (term: string) => void;
  results: CustomerSearchResult[];
  onPick: (customer: CustomerSearchResult) => void;
}

export function CustomerSearchBox({ placeholder, term, onTermChange, results, onPick }: CustomerSearchBoxProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={term}
        onChange={(e) => onTermChange(e.target.value)}
        placeholder={placeholder ?? 'Buscar por nome, email ou ID...'}
        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {results.length > 0 && (
        <div className="mt-2 border border-slate-700 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs hover:bg-slate-800 border-b border-slate-800 last:border-b-0"
            >
              <span className="font-semibold text-slate-200">{c.name}</span>
              <span className="text-slate-500">{c.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
