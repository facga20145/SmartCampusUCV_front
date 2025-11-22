import { useState } from 'react';
import { X, CheckCircle, MessageSquare } from 'lucide-react';
import { participacionService } from '../../services/api';

type Activity = {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
};

type ConfirmAsistenciaModalProps = {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
};

export function ConfirmAsistenciaModal({
  activity,
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}: ConfirmAsistenciaModalProps) {
  const [asistencia, setAsistencia] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'feedback'>('confirm');

  if (!isOpen) return null;

  async function handleConfirmAsistencia() {
    if (!asistencia) {
      // Si no asistió, solo confirmar sin feedback
      handleSubmit();
      return;
    }

    // Si asistió, mostrar formulario de feedback
    setStep('feedback');
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      // Calcular puntos: 10 puntos base por asistir, +5 si hay feedback
      const puntos = asistencia ? (feedback.trim() ? 15 : 10) : 0;

      await participacionService.create(
        activity.id,
        asistencia,
        feedback.trim() || undefined,
        puntos
      );

      onShowToast(
        asistencia
          ? `¡Asistencia confirmada! Has ganado ${puntos} puntos.`
          : 'Asistencia registrada.',
        'success'
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      onShowToast(
        error.message || 'Error al confirmar asistencia',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setAsistencia(true);
    setFeedback('');
    setStep('confirm');
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {step === 'confirm' ? 'Confirmar Asistencia' : 'Cuéntanos tu experiencia'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' ? (
            <>
              {/* Actividad */}
              <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-1">{activity.titulo}</h3>
                <p className="text-sm text-slate-600">
                  {new Date(activity.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-slate-600">{activity.lugar}</p>
              </div>

              {/* Pregunta */}
              <div className="mb-6">
                <p className="text-slate-700 mb-4 font-medium">
                  ¿Asististe a esta actividad?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setAsistencia(true)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      asistencia
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle
                      className={`w-6 h-6 ${
                        asistencia ? 'text-green-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Sí, asistí</p>
                      <p className="text-sm text-slate-600">
                        Obtendrás 10 puntos base + 5 puntos por feedback
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setAsistencia(false)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      !asistencia
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-red-300'
                    }`}
                  >
                    <X
                      className={`w-6 h-6 ${
                        !asistencia ? 'text-red-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">No asistí</p>
                      <p className="text-sm text-slate-600">
                        No recibirás puntos por esta actividad
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAsistencia}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium hover:opacity-90 transition"
                >
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Formulario de feedback */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900">
                    Comparte tu experiencia
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Cuéntanos qué aprendiste o qué te gustó de la actividad. 
                  Esto te dará 5 puntos adicionales.
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ejemplo: Aprendí sobre sostenibilidad ambiental y cómo puedo contribuir..."
                  className="w-full p-4 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none"
                  rows={5}
                />
                <p className="text-xs text-slate-500 mt-2">
                  {feedback.length} caracteres (opcional)
                </p>
              </div>

              {/* Info de puntos */}
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-slate-900">
                    Puntos que obtendrás: {feedback.trim() ? '15 puntos' : '10 puntos'}
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {feedback.trim()
                    ? '10 puntos por asistir + 5 puntos por feedback'
                    : '10 puntos por asistir'}
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

