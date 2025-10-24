import { useState, useEffect } from 'react';
import { Sparkles, Filter, X } from 'lucide-react';
import { useAuth } from '../components/contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Bottomnav } from '../components/layout/Bottomnav';

type Activity = {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha: string;
  hora: string;
  lugar: string;
  organizadorId: number;
  organizador?: {
    nombre: string;
    apellido: string;
  };
};

type Category = {
  id: string;
  name: string;
};

type ActivityCardProps = {
  activity: Activity;
  onViewActivity: (id: number) => void;
};

function ActivityCard({ activity, onViewActivity }: ActivityCardProps) {
  const date = new Date(activity.fecha);
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(date);

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewActivity(activity.id)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {activity.categoria}
          </span>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-slate-900">{formattedDate.split(' ')[0]}</span>
            <span className="text-xs text-slate-600">{formattedDate.split(' ')[1]}</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{activity.titulo}</h3>
        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{activity.descripcion}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full text-white flex items-center justify-center text-xs font-bold">
              {activity.organizador ? activity.organizador.nombre.charAt(0) : 'O'}
            </div>
            <span className="text-xs text-slate-600">
              {activity.organizador ? `${activity.organizador.nombre} ${activity.organizador.apellido}` : 'Organizador'}
            </span>
          </div>
          <span className="text-xs text-slate-500">{activity.lugar}</span>
        </div>
      </div>
    </div>
  );
}

type FilterPanelProps = {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
};

function FilterPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedDate,
  onSelectDate,
  selectedLocation,
  onSelectLocation,
  onClose,
  isMobile = false,
}: FilterPanelProps) {
  const dateOptions = [
    { id: 'all', label: 'Todas las fechas' },
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
  ];

  const locationOptions = [
    { id: 'all', label: 'Todas las ubicaciones' },
    { id: 'aula', label: 'Aulas' },
    { id: 'auditorio', label: 'Auditorios' },
    { id: 'campo', label: 'Campos deportivos' },
    { id: 'virtual', label: 'Virtual' },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${
        isMobile
          ? 'fixed inset-0 z-50 flex flex-col'
          : 'sticky top-[90px] h-fit'
      }`}
    >
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Filtros</h3>
          <button onClick={onClose} className="text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={`p-5 ${isMobile ? 'flex-1 overflow-auto' : ''}`}>
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Categorías</h4>
          <div className="space-y-2">
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Fecha</h4>
          <div className="space-y-2">
            {dateOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelectDate(option.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedDate === option.id
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Ubicación</h4>
          <div className="space-y-2">
            {locationOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelectLocation(option.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedLocation === option.id
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
          >
            Aplicar filtros
          </button>
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories] = useState<Category[]>([
    { id: 'deportiva', name: 'Deportiva' },
    { id: 'artistica', name: 'Artística' },
    { id: 'voluntariado', name: 'Voluntariado' },
    { id: 'canto', name: 'Canto' }
  ]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'registrations' | 'recommendations' | 'profile'>('home');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, searchQuery, selectedCategory, selectedDate, selectedLocation]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Simulando datos de actividades
      const mockActivities: Activity[] = [
        {
          id: 1,
          titulo: 'Limpieza de playa',
          descripcion: 'Únete a la jornada de limpieza de playa para contribuir al cuidado del medio ambiente.',
          categoria: 'voluntariado',
          fecha: '2023-11-15',
          hora: '09:00:00',
          lugar: 'Playa Huanchaco',
          organizadorId: 1,
          organizador: {
            nombre: 'Juan',
            apellido: 'Pérez'
          }
        },
        {
          id: 2,
          titulo: 'Taller de reciclaje creativo',
          descripcion: 'Aprende a transformar residuos en objetos útiles y decorativos.',
          categoria: 'artistica',
          fecha: '2023-11-20',
          hora: '15:00:00',
          lugar: 'Aula 301',
          organizadorId: 2,
          organizador: {
            nombre: 'María',
            apellido: 'López'
          }
        },
        {
          id: 3,
          titulo: 'Maratón ecológica',
          descripcion: 'Participa en esta carrera para promover la conciencia ambiental.',
          categoria: 'deportiva',
          fecha: '2023-11-25',
          hora: '07:00:00',
          lugar: 'Campus principal',
          organizadorId: 1,
          organizador: {
            nombre: 'Juan',
            apellido: 'Pérez'
          }
        },
        {
          id: 4,
          titulo: 'Concierto por el planeta',
          descripcion: 'Disfruta de música en vivo mientras apoyamos causas ambientales.',
          categoria: 'canto',
          fecha: '2023-11-30',
          hora: '18:00:00',
          lugar: 'Auditorio principal',
          organizadorId: 3,
          organizador: {
            nombre: 'Carlos',
            apellido: 'Rodríguez'
          }
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading data:', error);
      // Si hay un error, mostrar actividades vacías
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = activities;

    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((activity) => activity.categoria === selectedCategory);
    }

    if (selectedDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.fecha);
        if (selectedDate === 'today') {
          return activityDate.toDateString() === now.toDateString();
        } else if (selectedDate === 'week') {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return activityDate >= now && activityDate <= weekFromNow;
        } else if (selectedDate === 'month') {
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return activityDate >= now && activityDate <= monthFromNow;
        }
        return true;
      });
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter((activity) => {
        if (selectedLocation === 'aula') {
          return activity.lugar.toLowerCase().includes('aula');
        } else if (selectedLocation === 'auditorio') {
          return activity.lugar.toLowerCase().includes('auditorio');
        } else if (selectedLocation === 'campo') {
          return activity.lugar.toLowerCase().includes('campo') || activity.lugar.toLowerCase().includes('cancha');
        } else if (selectedLocation === 'virtual') {
          return activity.lugar.toLowerCase().includes('virtual') || activity.lugar.toLowerCase().includes('online');
        }
        return true;
      });
    }

    setFilteredActivities(filtered);
  }

  function handleViewActivity(id: number) {
    console.log(`Ver actividad ${id}`);
    // Aquí iría la navegación a la página de detalle de la actividad
  }

  function handleNavigate(page: 'home' | 'registrations' | 'recommendations' | 'profile') {
    setCurrentPage(page);
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 md:pb-0">
      <Header showSearch onSearch={setSearchQuery} />
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <Bottomnav currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="pt-[90px] md:pl-64 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {greeting()}, {user?.nombre || 'Usuario'}!
              </h2>
              <p className="text-slate-600">Descubre actividades sostenibles en tu campus</p>
            </div>

            <div className="md:hidden mb-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Actividades</h3>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg px-3 py-1.5"
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No hay actividades</h3>
                <p className="text-slate-600 mb-6">
                  No se encontraron actividades con los filtros seleccionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedDate('all');
                    setSelectedLocation('all');
                    setSearchQuery('');
                  }}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onViewActivity={handleViewActivity}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="md:w-1/4">
            <div className="hidden md:block">
              <FilterPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
              />
            </div>
          </div>
        </div>
      </main>

      {showMobileFilters && (
        <FilterPanel
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onClose={() => setShowMobileFilters(false)}
          isMobile
        />
      )}
    </div>
  );
}