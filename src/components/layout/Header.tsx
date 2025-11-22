import { Leaf, Search } from 'lucide-react';

type HeaderProps = {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
};

export function Header({ onSearch, showSearch = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900">SmartCampus UCV</h1>
              <p className="text-xs text-slate-600">Sostenibilidad Universitaria</p>
            </div>
          </div>

          {showSearch && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar actividades..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}