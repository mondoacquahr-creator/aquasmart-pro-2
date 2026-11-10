import { useNavigate } from 'react-router';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { MondoFooter } from './MondoFooter';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MessageCircle, Send, Loader2 } from 'lucide-react';
import { MondoFooter } from './MondoFooter';
import { api } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  timestamp: string;
}

export function OwnerChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if current user is a demo user or guest
  const isDemoUser = user?.email === 'profesionalac@aquasmart.hr' || 
                     user?.email === 'klijent@gmail.com' || 
                     user?.id.startsWith('demo-') || 
                     user?.id.startsWith('guest_');

  const fetchMessages = async () => {
    if (!user) return;
    
    // If demo user, don't call API
    if (isDemoUser) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'demo-msg-1',
            text: 'Pozdrav! Ovo je demo verzija chata. Ovdje možete isprobati sučelje.',
            senderId: 'admin',
            senderName: 'Mondo Acqua Agent',
            isAdmin: true,
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          }
        ]);
      }
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get('messages');
      if (data && Array.isArray(data)) {
        setMessages(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling for new messages
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user || isSending) return;

    setIsSending(true);
    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: inputText,
      senderId: user.id,
      senderName: user.user_metadata?.name || user.email || 'Korisnik',
      isAdmin: false,
      timestamp: new Date().toISOString(),
    };

    if (isDemoUser) {
      // Simulate sending for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setIsSending(false);
      
      // Auto reply simulation
      setTimeout(() => {
        const reply: Message = {
          id: crypto.randomUUID(),
          text: 'Hvala na poruci! Ovo je automatski odgovor u demo verziji.',
          senderId: 'admin',
          senderName: 'Mondo Acqua Agent',
          isAdmin: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);
      return;
    }

    try {
      await api.post('messages', newMessage);
      setMessages([...messages, newMessage]);
      setInputText('');
    } catch (err) {
      toast.error('Greška pri slanju poruke.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-amber-500/20 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-amber-500" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <MessageCircle className="w-6 h-6 text-amber-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Chat podrška</h1>
              <p className="text-xs text-amber-500/70 font-medium">Mondo Acqua Agent - Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto space-y-4"
      >
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 shadow-lg border border-amber-500/10 max-w-[85%]">
                  <p className="text-sm text-slate-200">
                    Pozdrav! 👋 Ja sam vaš AcquaSmart agent. Kako vam mogu pomoći danas s vašim bazenom?
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">Sustav podrške</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] rounded-2xl p-4 shadow-lg border 
                  ${msg.senderId === user?.id 
                    ? 'bg-amber-600 border-amber-400 text-white rounded-tr-none' 
                    : 'bg-slate-800 border-slate-700 text-slate-200 rounded-tl-none'
                  }
                `}>
                  {!msg.isAdmin && msg.senderId !== user?.id && (
                    <p className="text-[10px] font-bold text-amber-500 mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-2 ${msg.senderId === user?.id ? 'text-amber-200' : 'text-slate-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-slate-800 border-t border-amber-500/20 p-4 sticky bottom-0">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Napišite poruku..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-white transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-amber-500 hover:to-yellow-500 transition-all shadow-lg disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

      <MondoFooter />
    </div>
  );
}
