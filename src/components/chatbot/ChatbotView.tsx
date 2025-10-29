import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatbotService } from '../../services/api';

type Message = {
  id: number;
  mensajeUsuario: string;
  respuestaBot: string;
  fecha: string;
  isUser: boolean;
};

export function ChatbotView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        {
          id: 0,
          mensajeUsuario: '',
          respuestaBot: `¡Hola ${user.nombre}! 👋 Soy tu asistente de SmartCampus. Puedo ayudarte a:\n\n• Obtener recomendaciones personalizadas de actividades\n• Inscribirte automáticamente en actividades\n• Responder tus preguntas sobre el campus\n\n¿En qué puedo ayudarte hoy?`,
          fecha: new Date().toISOString(),
          isUser: false,
        },
      ]);
    }
  }, [user, messages.length]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage() {
    if (!inputMessage.trim() || !user || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Agregar mensaje del usuario
    const userMsg: Message = {
      id: Date.now(),
      mensajeUsuario: userMessage,
      respuestaBot: '',
      fecha: new Date().toISOString(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await chatbotService.sendMessage(user.id, userMessage);

      // Agregar respuesta del bot
      const botMsg: Message = {
        id: response.id || Date.now() + 1,
        mensajeUsuario: userMessage,
        respuestaBot: response.respuestaBot || 'Lo siento, no pude procesar tu mensaje.',
        fecha: response.fecha || new Date().toISOString(),
        isUser: false,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        mensajeUsuario: userMessage,
        respuestaBot: '⚠️ Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        fecha: new Date().toISOString(),
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  // Sugerencias rápidas
  const quickSuggestions = [
    'Recomiéndame actividades',
    '¿Qué actividades hay disponibles?',
    'Quiero inscribirme en una actividad',
    'Actividades de medio ambiente',
  ];

  function handleQuickSuggestion(suggestion: string) {
    setInputMessage(suggestion);
  }

  function formatMessage(text: string): string {
    // Convertir saltos de línea y formato básico
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Asistente Virtual</h1>
              <p className="text-slate-600 text-sm">Chat con IA para recomendaciones e inscripciones</p>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-green-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm font-medium whitespace-pre-wrap">{message.mensajeUsuario}</p>
                  ) : (
                    <div
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.respuestaBot) }}
                    />
                  )}
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-slate-600">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
              <p className="text-xs text-slate-600 mb-2 font-medium">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-full text-slate-700 hover:bg-slate-100 hover:border-blue-400 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-200">
            <div className="flex gap-3 items-end">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Puedes pedir recomendaciones personalizadas, inscribirte en actividades
            diciendo "quiero inscribirme en la actividad X", o hacer cualquier pregunta sobre las actividades del campus.
          </p>
        </div>
      </div>
    </div>
  );
}

