import { HelpCircle, FileText, Shield, ChevronRight } from 'lucide-react';
import type { ActivePage } from '../../types';

const ITEMS = [
  { page: 'ajuda' as ActivePage, icon: HelpCircle, label: 'Central de Ajuda' },
  { page: 'termos' as ActivePage, icon: FileText, label: 'Termos de Uso' },
  { page: 'privacidade' as ActivePage, icon: Shield, label: 'Política de Privacidade' },
];

export function LegalMenu({ onNavigate }: { onNavigate: (page: ActivePage) => void }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '450ms' }}>
      <h3 className="text-sm font-bold text-slate-200 mb-4">Ajuda & Legal</h3>

      <div className="space-y-2">
        {ITEMS.map(({ page, icon: Icon, label }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-smooth group"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-slate-400 group-hover:text-blue-400 transition-smooth" />
              <span className="text-sm text-slate-200 font-medium">{label}</span>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-smooth" />
          </button>
        ))}
      </div>
    </div>
  );
}
