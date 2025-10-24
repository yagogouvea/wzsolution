'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Clock, Phone } from 'lucide-react';
import { useGoogleAnalytics } from '@/components/GoogleAnalytics';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>>([]);
  const { trackEvent } = useGoogleAnalytics();

  useEffect(() => {
    // Simular status online/offline baseado no horário
    const now = new Date();
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour <= 18;
    setIsOnline(isBusinessHours);

    // Adicionar mensagem de boas-vindas
    if (chatHistory.length === 0) {
      addMessage('Olá! Como posso ajudá-lo hoje?', false);
    }
  }, []);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage = {
      id: Date.now(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Adicionar mensagem do usuário
    addMessage(message, true);
    
    // Track event
    trackEvent('live_chat_message', {
      message_length: message.length,
      is_online: isOnline,
    });

    // Simular resposta automática
    setTimeout(() => {
      if (isOnline) {
        addMessage('Obrigado pela sua mensagem! Vou responder em breve via WhatsApp.', false);
      } else {
        addMessage('Estamos fora do horário comercial. Deixe sua mensagem que responderemos em breve!', false);
      }
    }, 1000);

    setMessage('');
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '5511947293221';
    const defaultMessage = isOnline 
      ? 'Olá! Gostaria de conversar sobre um projeto.'
      : 'Olá! Deixei uma mensagem no chat do site e gostaria de continuar a conversa.';
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    
    // Track event
    trackEvent('live_chat_whatsapp_redirect', {
      is_online: isOnline,
      chat_messages: chatHistory.length,
    });
    
    window.open(url, '_blank');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Track event
    trackEvent('live_chat_toggle', {
      action: isOpen ? 'close' : 'open',
      is_online: isOnline,
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-20 right-6 z-40 bg-green-600 hover:bg-green-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Abrir chat ao vivo"
      >
        <MessageCircle className="w-6 h-6" />
        {!isOnline && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <h3 className="font-semibold">WZ Solution</h3>
                <p className="text-xs text-slate-300">
                  {isOnline ? 'Online agora' : 'Fora do horário'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-slate-300 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.isUser
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            {isOnline ? (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-md transition-colors duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md text-sm transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Continuar no WhatsApp</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Fora do horário comercial</span>
                </div>
                
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md text-sm transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
