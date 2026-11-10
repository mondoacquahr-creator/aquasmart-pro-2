import { useNavigate, useLocation } from 'react-router';
import { Home, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { 
      path: '/app', 
      icon: Home, 
      label: 'Početna',
      gradient: 'from-gold-600 to-gold-400',
      match: (path: string) => path === '/app'
    },
    { 
      path: '/app/more', 
      icon: Menu, 
      label: 'Više',
      gradient: 'from-gold-500 to-gold-600',
      match: (path: string) => path.startsWith('/app/more') || path.startsWith('/app/settings') || path.startsWith('/app/ai-recommendations') || path.startsWith('/app/orp-intelligence') || path.startsWith('/app/instructions')
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    return item.match(location.pathname);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism Nav Bar */}
      <div className="relative">
        {/* Blur Background - DARK */}
        <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-xl border-t border-amber-500/20 shadow-2xl" />
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 py-3">
          <div className="grid grid-cols-2 gap-2">{navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                {active ? (
                  // Active State - Gradient with glow
                  <motion.div
                    layoutId="activeNav"
                    className={`bg-gradient-to-r ${item.gradient} rounded-2xl p-3 shadow-lg`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl blur-lg opacity-50 -z-10`} />
                    
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <span className="text-xs font-bold text-white">
                        {item.label}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  // Inactive State - DARK
                  <div className="p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">
                        {item.label}
                      </span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
          </div>
        </div>

        {/* Decorative gradient line on top - GOLD */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-70" />
      </div>
    </div>
  );
}