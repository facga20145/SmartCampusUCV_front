import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { participacionService } from '../../services/api';

type RankingEntry = {
  usuarioId: number;
  puntos: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    correoInstitucional: string;
    foto?: string;
  };
};

export function RankingView() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState<number>(0);

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    setLoading(true);
    try {
      const data = await participacionService.getRankingGlobal(100); // Top 100
      setRanking(data);
      
      // Encontrar mi posición
      if (user) {
        const myIndex = data.findIndex((entry: RankingEntry) => entry.usuario?.id === user.id);
        if (myIndex !== -1) {
          setMyPosition(myIndex + 1);
          setMyPoints(data[myIndex].puntos);
        } else {
          // Si no estoy en el top 100, buscar mi posición total
          const allData = await participacionService.getRankingGlobal(1000);
          const myIndex = allData.findIndex((entry: RankingEntry) => entry.usuario?.id === user.id);
          if (myIndex !== -1) {
            setMyPosition(myIndex + 1);
            setMyPoints(allData[myIndex].puntos);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(position: number) {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-slate-400">{position}</span>;
    }
  }

  function getRankColor(position: number) {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-slate-50 border border-slate-200';
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600">Cargando ranking...</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Ranking de Sostenibilidad</h2>
        <p className="text-slate-600">
          Los usuarios más comprometidos con las actividades sostenibles
        </p>
      </div>

      {/* Mi posición */}
      {myPosition !== null && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tu posición</p>
              <p className="text-2xl font-bold text-slate-900">
                #{myPosition} en el ranking
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Tus puntos</p>
              <p className="text-2xl font-bold text-green-600">{myPoints}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de ranking */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Posición</th>
                <th className="px-6 py-4 text-left font-semibold">Usuario</th>
                <th className="px-6 py-4 text-right font-semibold">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No hay datos de ranking aún
                  </td>
                </tr>
              ) : (
                ranking.map((entry, index) => {
                  const position = index + 1;
                  const isMe = user && entry.usuario?.id === user.id;
                  
                  return (
                    <tr
                      key={entry.usuarioId}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-green-50 border-l-4 border-green-500'
                          : 'hover:bg-slate-50'
                      } ${getRankColor(position)}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(position)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.usuario?.foto ? (
                            <img
                              src={entry.usuario.foto}
                              alt={entry.usuario.nombre}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              {entry.usuario?.nombre?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                            </div>
                          )}
                          <div>
                            <p className={`font-semibold ${position <= 3 ? 'text-white' : 'text-slate-900'}`}>
                              {entry.usuario
                                ? `${entry.usuario.nombre} ${entry.usuario.apellido}`
                                : 'Usuario desconocido'}
                            </p>
                            <p className={`text-sm ${position <= 3 ? 'text-white/80' : 'text-slate-600'}`}>
                              {entry.usuario?.correoInstitucional}
                            </p>
                          </div>
                          {isMe && (
                            <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full font-medium">
                              Tú
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-bold ${position <= 3 ? 'text-white' : 'text-slate-900'}`}>
                          {entry.puntos} pts
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-slate-700">
          <strong>¿Cómo ganar puntos?</strong>
          <br />
          • 10 puntos por asistir a una actividad
          <br />
          • +5 puntos adicionales por compartir tu feedback
        </p>
      </div>
    </div>
  );
}

