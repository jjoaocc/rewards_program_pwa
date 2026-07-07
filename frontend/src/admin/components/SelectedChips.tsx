interface SelectedChipsProps {
  customers: Record<string, string>; // id -> nome
  onRemove: (id: string) => void;
}

export function SelectedChips({ customers, onRemove }: SelectedChipsProps) {
  const ids = Object.keys(customers);

  if (ids.length === 0) {
    return <p className="text-xs text-slate-600 mb-4">Nenhum cliente selecionado ainda.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {ids.map((id) => (
        <span
          key={id}
          className="flex items-center gap-1.5 bg-blue-900/40 text-blue-300 rounded-full pl-3 pr-1.5 py-1 text-xs font-semibold"
        >
          {customers[id]}
          <button
            type="button"
            onClick={() => onRemove(id)}
            aria-label={`Remover ${customers[id]}`}
            className="hover:text-blue-100"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}
