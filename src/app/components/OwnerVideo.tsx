import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Video, Mic, MicOff, VideoOff, PhoneOff, MessageCircle, Loader2 } from 'lucide-react';
import { MondoFooter } from './MondoFooter';
import { useAuth } from '../contexts/AuthContext';

export function OwnerVideo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a unique room name based on user ID for privacy, or a shared room for support
  const roomName = user ? `AquaSmart_Support_${user.id.substring(0, 8)}` : 'AquaSmart_Support_Guest';
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=false`;

  useEffect(() => {
    // Simulate loading the iframe
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-amber-500/20 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-amber-500" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Video className="w-6 h-6 text-amber-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Video podrška</h1>
              <p className="text-xs text-amber-500/70 font-medium">Poziv sa stručnjakom - Mondo Acqua</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black overflow-hidden flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-amber-500 font-medium animate-pulse">Spajanje na sigurni kanal...</p>
          </div>
        ) : (
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-none"
            title="Jitsi Video Call"
          />
        )}
      </div>

      {/* Bottom Note */}
      <div className="bg-slate-800 p-4 text-center border-t border-amber-500/20">
        <p className="text-xs text-slate-400">
          Ovaj video poziv je kriptiran i siguran. Osigurajte dobru internet vezu i pristup kameri/mikrofonu.
        </p>
      </div>

      <MondoFooter />
    </div>
  );
}
