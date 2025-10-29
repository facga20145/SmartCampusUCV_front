import { Home, Calendar, Lightbulb, User, Plus, Trophy, Award, Bot } from 'lucide-react';
import { useIsAdmin } from '../contexts/AuthContext';

type BottomnavProps = {
  currentPage: 'home' | 'registrations' | 'recommendations' | 'profile' | 'create' | 'ranking' | 'reconocimientos' | 'chatbot';
  onNavigate: (page: 'home' | 'registrations' | 'recommendations' | 'profile' | 'create' | 'ranking' | 'reconocimientos' | 'chatbot') => void;
  canCreateActivities?: boolean;
};

export function Bottomnav({ currentPage, onNavigate, canCreateActivities = false }: BottomnavProps) {
  const isAdmin = useIsAdmin();
  
  // Nav items según si puede crear actividades
  const navItems = canCreateActivities
    ? [
        { id: 'home' as const, icon: Home, label: 'Inicio' },
        { id: 'create' as const, icon: Plus, label: 'Crear' },
        ...(isAdmin ? [{ id: 'reconocimientos' as const, icon: Award, label: 'Badges' }] : []),
        { id: 'profile' as const, icon: User, label: 'Perfil' },
      ]
    : [
        { id: 'home' as const, icon: Home, label: 'Inicio' },
        { id: 'registrations' as const, icon: Calendar, label: 'Inscripciones' },
        { id: 'chatbot' as const, icon: Bot, label: 'IA' },
        { id: 'ranking' as const, icon: Trophy, label: 'Ranking' },
        { id: 'profile' as const, icon: User, label: 'Perfil' },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center py-3 px-4 flex-1"
            >
              <div
                className={`p-1.5 rounded-full ${
                  isActive ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'font-medium text-slate-900' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}