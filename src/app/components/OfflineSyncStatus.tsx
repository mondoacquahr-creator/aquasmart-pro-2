import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncData } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

export function OfflineSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Povezani ste na internet. Pokretanje sinkronizacije...');
      handleSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Izgubljena veza s internetom. Aplikacija radi u izvanmrežnom načinu rada.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) {
      toast.error('Nije moguće sinkronizirati u izvanmrežnom načinu rada.');
      return;
    }

    setIsSyncing(true);
    try {
      await syncData();
      setLastSync(new Date());
      toast.success('Podaci sinkronizirani s poslužiteljem.');
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Greška pri sinkronizaciji podataka.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 backdrop-blur-md border border-amber-500/20 rounded-full shadow-lg shadow-black/50">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="flex items-center gap-2 text-green-500">
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Offline</span>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-700 mx-1" />

      <button
        onClick={handleSync}
        disabled={isSyncing || !isOnline}
        className={`flex items-center gap-2 transition-all ${
          isSyncing ? 'text-amber-500 animate-pulse' : 'text-slate-300 hover:text-amber-500'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Ručna sinkronizacija"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        <span className="text-xs font-medium">
          {isSyncing ? 'Sinkronizacija...' : lastSync ? `Zadnje: ${lastSync.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}` : 'Sinkroniziraj'}
        </span>
      </button>

      {!isOnline && (
        <div className="group relative">
          <AlertCircle className="w-4 h-4 text-amber-500 cursor-help" />
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 border border-amber-500/30 rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
            Aplikacija sprema promjene lokalno i sinkronizirat će ih kada se ponovno povežete.
          </div>
        </div>
      )}
    </div>
  );
}
