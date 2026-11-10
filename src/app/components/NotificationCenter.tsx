import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Trash2, X } from 'lucide-react';
import { api, supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface Notification {
  id: string;
  timestamp: string;
  message: string;
  title: string;
  read: boolean;
  fromUserName?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const data = await api.get('notifications');
      // The API returns an array of items, we need to sort them by timestamp
      const sorted = (data || []).sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setNotifications(sorted);
      setUnreadCount(sorted.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        await api.post('notifications', { ...notification, read: true });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error('Greška pri označavanju obavijesti');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete('notifications', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const deleted = notifications.find(n => n.id === id);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Obavijest obrisana');
    } catch (err) {
      toast.error('Greška pri brisanju obavijesti');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-amber-500 transition-colors bg-slate-800/50 rounded-full border border-amber-500/20"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 max-h-[400px] bg-slate-800 border border-amber-500/30 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-amber-500/20 bg-slate-800/90 backdrop-blur-sm flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Obavijesti
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <BellOff className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Nema novih obavijesti</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-slate-700/50 transition-colors relative group ${
                      !notification.read ? 'bg-amber-500/5' : 'hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-amber-500 font-medium">
                        {new Date(notification.timestamp).toLocaleString('hr-HR')}
                      </span>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                            title="Označi kao pročitano"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          title="Obriši"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white pr-6">{notification.title}</h4>
                    <p className="text-sm text-slate-300 mt-1">{notification.message}</p>
                    {notification.fromUserName && (
                      <p className="text-[10px] text-slate-500 mt-2 italic">Šalje: {notification.fromUserName}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
