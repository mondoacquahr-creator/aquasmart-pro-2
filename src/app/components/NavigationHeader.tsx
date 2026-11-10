import { ArrowLeft, Home, Menu, X, ChevronDown, User, Settings as SettingsIcon, LogOut, Briefcase, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../lib/languageContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationHeaderProps {
  title?: string;
  onBack?: () => void;
  showHome?: boolean;
  showMenu?: boolean;
  variant?: 'light' | 'dark' | 'transparent';
}

export function NavigationHeader({ 
  title, 
  onBack, 
  showHome = true, 
  showMenu = true,
  variant = 'dark' 
}: NavigationHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') as 'employee' | 'employer' | null;

  const menuItems = [
    { 
      label: 'Početna', 
      icon: Home, 
      onClick: () => {
        navigate('/app');
        setIsMenuOpen(false);
      }
    },
    { 
      label: t('common.analytics'), 
      icon: SettingsIcon, 
      onClick: () => {
        navigate('/app/analytics-dashboard');
        setIsMenuOpen(false);
      }
    },
    ...(userRole === 'employer' ? [{
      label: t('home.actions.employees'),
      icon: UsersIcon,
      onClick: () => {
        navigate('/app/employee-management');
        setIsMenuOpen(false);
      }
    }] : []),
    { 
      label: t('common.warehouse'), 
      icon: Briefcase, 
      onClick: () => {
        navigate('/app/warehouse');
        setIsMenuOpen(false);
      }
    },
    { 
      label: t('common.settings'), 
      icon: SettingsIcon, 
      onClick: () => {
        navigate('/app/settings');
        setIsMenuOpen(false);
      }
    },
  ];

  const bgColor = variant === 'dark' ? '#030213' : variant === 'light' ? '#FFFFFF' : 'transparent';
  const textColor = variant === 'light' ? '#000000' : '#FFFFFF';
  const borderColor = variant === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  return (
    <>
      <div 
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ 
          background: variant === 'transparent' ? 'rgba(3,2,19,0.8)' : bgColor,
          borderBottom: `1px solid ${borderColor}`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Back & Home */}
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl hover:bg-white/5 transition-all border border-white/10"
                  style={{ color: textColor }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              {showHome && !onBack && (
                <button
                  onClick={() => navigate('/app')}
                  className="p-2 rounded-xl hover:bg-white/5 transition-all border border-white/10"
                  style={{ color: textColor }}
                >
                  <Home className="w-5 h-5" />
                </button>
              )}
              
              {title && (
                <h1 className="ml-2 text-lg font-black uppercase tracking-wider" style={{ color: textColor }}>
                  {title}
                </h1>
              )}
            </div>

            {/* Center Section - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:block">
              <button 
                onClick={() => navigate('/app')}
                className="text-xl font-black tracking-tight"
              >
                <span style={{ color: textColor }}>AQUA</span>
                <span className="text-[#D4AF37]">SMART</span>
              </button>
            </div>

            {/* Right Section - Menu & User */}
            <div className="flex items-center gap-2">
              {/* Navigation Menu */}
              {showMenu && (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-xl hover:bg-white/5 transition-all border border-white/10 flex items-center gap-2"
                    style={{ color: textColor }}
                  >
                    <Menu className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-bold">MENU</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsMenuOpen(false)}
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50"
                          style={{
                            background: '#1a1d23',
                            borderColor: 'rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="p-2">
                            {menuItems.map((item, index) => (
                              <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                              >
                                <item.icon className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-bold text-white">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all border border-white/10"
                    style={{ color: textColor }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-black" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold">{user.name}</div>
                      <div className="text-[10px] text-[#D4AF37] uppercase tracking-widest">
                        {userRole === 'employer' ? t('roles.employer') : t('roles.employee')}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border z-50"
                          style={{
                            background: '#1a1d23',
                            borderColor: 'rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="p-2">
                            <button
                              onClick={() => {
                                navigate('/app/settings');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left"
                            >
                              <SettingsIcon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-bold text-white">{t('common.settings')}</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate('/role-selection');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left"
                            >
                              <User className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-bold text-white">{t('roles.changeProfile')}</span>
                            </button>
                            <div className="h-px bg-white/10 my-2" />
                            <button
                              onClick={() => {
                                logout();
                                navigate('/');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-left text-red-400"
                            >
                              <LogOut className="w-5 h-5" />
                              <span className="text-sm font-bold">{t('common.logout')}</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Logo - visible when title is present */}
      {title && (
        <div className="sm:hidden text-center py-2 border-b border-white/10">
          <button 
            onClick={() => navigate('/app')}
            className="text-lg font-black tracking-tight"
          >
            <span style={{ color: textColor }}>AQUA</span>
            <span className="text-[#D4AF37]">SMART</span>
          </button>
        </div>
      )}
    </>
  );
}