import { Home, Calendar, Lightbulb, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type SidebarProps = {
  currentPage: 'home' | 'registrations' | 'recommendations' | 'profile';
  onNavigate: (page: 'home' | 'registrations' | 'recommendations' | 'profile') => void;
};

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { signOut, user } = useAuth();

  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Inicio' },
    { id: 'registrations' as const, icon: Calendar, label: 'Mis Inscripciones' },
    { id: 'recommendations' as const, icon: Lightbulb, label: 'Recomendaciones' },
    { id: 'profile' as const, icon: User, label: 'Mi Perfil' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed left-0 top-[73px] bottom-0 z-40">
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
          <p className="text-sm font-semibold text-slate-900">
            {user?.nombre && user?.apellido
              ? `${user.nombre} ${user.apellido}`
              : 'Usuario'}
          </p>
          <p className="text-xs text-slate-600 mt-1">{user?.correoInstitucional || ''}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}