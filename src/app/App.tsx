import { SiteHeader } from './components/SiteHeader';
import { AppHome, isStandalone } from './components/AppHome';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { HomePageNew } from './components/HomePageNew';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { FreePortal } from './components/FreePortal';
import { EmployerDashboard } from './components/EmployerDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { MondoAdmin } from './components/MondoAdmin';
import { WaterAnalysis } from './components/WaterAnalysis';
import { ChemicalProducts } from './components/ChemicalProducts';
import { MondoShop } from './components/MondoShop';
import { StoreLocator } from './components/StoreLocator';
import { ProductShowcase } from './components/ProductShowcase';
import { VisualizerPage } from './components/VisualizerPage';
import { Home } from 'lucide-react';
import { LanguageProvider } from './lib/languageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProPortal } from './components/ProPortal';
import { GuestAnalysis } from './components/GuestAnalysis';
import { WaterBackground } from './components/WaterBackground';
import { MemberPortal } from './components/MemberPortal';
import { T } from './lib/theme';
import { countVisit } from './lib/stat';

const VISUALIZER_ENABLED = true;

type Page = 'home' | 'visualizer' | 'promo' | 'analysis' | 'products' | 'login' | 'register' | 'member-register' | 'free-portal' | 'pro-portal' | 'member-portal' | 'water-analysis' | 'stores' | 'guest-analysis' | 'shop';

// Main App Component - Updated with ProductShowcase
export default function App() {
  // Ulaz s glavne stranice mondo-acqua.hr: ?stranica=webshop|analiza|prijava|registracija|clan
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    try {
      const map: Record<string, Page> = { webshop: 'products', analiza: 'analysis', prijava: 'login', registracija: 'register', clan: 'member-register', vizualizator: 'visualizer' };
      return map[new URLSearchParams(window.location.search).get('stranica') || ''] || 'home';
    } catch { return 'home'; }
  });
  const [prevPage, setPrevPage] = useState<Page | null>(null);
  const [returnPage, setReturnPage] = useState<Page | null>(null);
  const isPoppingState = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem('isDemo') === 'true');
  const [userRole, setUserRole] = useState<'employee' | 'employer' | 'admin' | 'member' | null>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole === 'employee' || savedRole === 'employer' || savedRole === 'admin' || savedRole === 'member') ? savedRole : null;
  });

  // Placeholder component for coming soon features
  const ComingSoonPlaceholder = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any; color: string }) => (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8" style={{ background: T.pageBg }}>
      <WaterBackground />

      <div className="relative z-10 text-center max-w-2xl">
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8" style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}>
          <Icon className="w-16 h-16" style={{ color: T.cyan }} />
        </div>
        <h1 className="text-5xl font-black text-white mb-4">{title}</h1>
        <p className="text-2xl mb-8" style={{ color: T.muted }}>{subtitle}</p>
        <div className="rounded-2xl p-6 mb-8" style={{ background: T.cardBg, border: T.cardBorder }}>
          <p className="text-lg leading-relaxed" style={{ color: T.muted }}>
            Ova funkcionalnost je u development fazi i bit će dostupna uskoro.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('home')}
          className="px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform text-black"
          style={{ background: T.accent, boxShadow: '0 8px 30px rgba(79,195,240,0.35)' }}
        >
          Povratak na Početnu
        </button>
      </div>
    </div>
  );

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const savedRole = localStorage.getItem('userRole');
    const role = (savedRole === 'employee' || savedRole === 'employer' || savedRole === 'admin' || savedRole === 'member') ? savedRole : null;
    setUserRole(role);
    setIsDemo(localStorage.getItem('isDemo') === 'true');
    setCurrentPage(savedRole === 'member' ? 'member-portal' : 'pro-portal');
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    const savedRole = localStorage.getItem('userRole');
    const role = (savedRole === 'employee' || savedRole === 'employer' || savedRole === 'admin' || savedRole === 'member') ? savedRole : null;
    setUserRole(role);
    setIsDemo(localStorage.getItem('isDemo') === 'true');
    setCurrentPage(savedRole === 'member' ? 'member-portal' : 'pro-portal');
  };

  // Mondo admin može raditi i kao servis (Pro portal vlastite tvrtke)
  const [adminView, setAdminView] = useState<'admin' | 'company'>(() => {
    try { return localStorage.getItem('admin_view') === 'company' ? 'company' : 'admin'; } catch { return 'admin'; }
  });
  const switchAdminView = (v: 'admin' | 'company') => {
    setAdminView(v);
    try { localStorage.setItem('admin_view', v); } catch { /* ignore */ }
    window.scrollTo(0, 0);
  };

  const openShop = () => {
    setPrevPage(currentPage);
    setCurrentPage('shop');
  };

  useEffect(() => {
    if (currentPage === 'visualizer' && (!VISUALIZER_ENABLED || isStandalone())) setCurrentPage('home');
  }, [currentPage]);

  // Brojač posjeta (bez kolačića): jedna bilješka po otvorenoj stranici aplikacije.
  useEffect(() => { countVisit(currentPage); }, [currentPage]);

  // Mondo Acqua glavna stranica je početna: povratak na 'home' unutar weba vodi na nju.
  // Instalirana aplikacija (Google Play / dodano na početni zaslon) i dalje ostaje na Pool Care početnoj.
  const firstPage = useRef(true);
  useEffect(() => {
    if (firstPage.current) { firstPage.current = false; return; }
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (currentPage === 'home' && !standalone) window.location.href = 'https://www.mondo-acqua.hr/';
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    if (page === 'visualizer' && !VISUALIZER_ENABLED) page = 'home';
    if (page === 'home') {
      setReturnPage(null);
    } else if (currentPage === 'pro-portal') {
      setReturnPage('pro-portal');
    } else if (currentPage === 'member-portal') {
      setReturnPage('member-portal');
    }
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setIsDemo(false);
    setReturnPage(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('isDemo');
    localStorage.removeItem('memberPlan');
    sessionStorage.removeItem('employer_view');
    sessionStorage.removeItem('employee_view');
    setCurrentPage('home');
  };

  const handleNavigateFromMember = (page: string) => {
    setReturnPage('member-portal');
    setCurrentPage(page as Page);
  };

  const handleRoleSelect = (role: 'employee' | 'employer' | 'admin') => {
    if (!isDemo) return;
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  // Password recovery overlay state
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Every page change starts at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentPage]);

  // Push history state on page change (skip when triggered by popstate)
  useEffect(() => {
    if (isPoppingState.current) {
      isPoppingState.current = false;
      return;
    }
    window.history.pushState({ page: currentPage }, '');
  }, [currentPage]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = (event.state?.page as Page) || 'home';
      // While logged in and on pro-portal or member-portal, don't leave
      if (isLoggedIn && (currentPage === 'pro-portal' || currentPage === 'member-portal') && (page === 'home' || page === 'login')) {
        window.history.pushState({ page: currentPage }, '');
        return;
      }
      isPoppingState.current = true;
      setCurrentPage(page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoggedIn, currentPage]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordRecovery(true);
        setNewPassword('');
        setConfirmPassword('');
        setRecoveryError('');
        setRecoverySuccess(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordRecoverySave = async () => {
    if (newPassword.length < 8) {
      setRecoveryError('Lozinka mora imati najmanje 8 znakova.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('Lozinke se ne podudaraju.');
      return;
    }
    setRecoveryError('');
    setRecoveryLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setRecoveryLoading(false);
    if (error) {
      setRecoveryError('Promjena lozinke nije uspjela. Zatražite novu poveznicu.');
    } else {
      setRecoverySuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => {
        setShowPasswordRecovery(false);
        setCurrentPage('login');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: T.pageBg }}>
      <LanguageProvider>
        <AuthProvider>
          {['home','login','register','member-register','free-portal','guest-analysis','visualizer','analysis','water-analysis','products','shop','stores'].includes(currentPage) && <SiteHeader app={isStandalone()} onNavigate={(p) => handleNavigate(p)} />}
          {currentPage === 'home' && (isStandalone() ? <AppHome onNavigate={(page) => handleNavigate(page)} /> : <HomePageNew onNavigate={(page) => handleNavigate(page)} />)}
          {currentPage === 'login' && <LoginPage onBack={() => setCurrentPage('home')} onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setCurrentPage('register')} />}
          {currentPage === 'register' && <RegisterPage onBack={() => setCurrentPage('home')} onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setCurrentPage('login')} />}
          {currentPage === 'member-register' && <RegisterPage initialType="member" onBack={() => setCurrentPage('home')} onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setCurrentPage('login')} />}
          {currentPage === 'free-portal' && <FreePortal onBack={() => setCurrentPage('home')} onGuestAnalysis={() => setCurrentPage('guest-analysis')} onOpenShop={openShop} onMemberArea={() => setCurrentPage(localStorage.getItem('userRole') === 'member' ? 'member-portal' : 'member-register')} />}
          {currentPage === 'guest-analysis' && <GuestAnalysis onBack={() => setCurrentPage('free-portal')} onRegister={() => setCurrentPage('member-register')} onRegisterMember={() => setCurrentPage('member-register')} onLogin={() => setCurrentPage('login')} onOpenShop={openShop} />}
          {/* AI vizualizator je privremeno isključen (prelazi na glavnu stranicu Mondo Acque) */}
          {VISUALIZER_ENABLED && currentPage === 'visualizer' && <VisualizerPage onBack={() => setCurrentPage(returnPage || 'home')} onOpenShop={openShop} />}
          {currentPage === 'promo' && <ProductShowcase onClose={() => setCurrentPage('home')} onNavigate={(page) => handleNavigate(page)} />}
          {currentPage === 'analysis' && <WaterAnalysis onBack={() => setCurrentPage(returnPage || 'home')} onOpenShop={openShop} onRegisterMember={() => setCurrentPage('member-register')} onLogin={() => setCurrentPage('login')} />}
          {currentPage === 'water-analysis' && <WaterAnalysis onBack={() => setCurrentPage(returnPage || 'home')} onOpenShop={openShop} onRegisterMember={() => setCurrentPage('member-register')} onLogin={() => setCurrentPage('login')} />}
          {(currentPage === 'products' || currentPage === 'shop') && <MondoShop onBack={() => setCurrentPage(returnPage || prevPage || 'home')} onRegisterMember={() => setCurrentPage('member-register')} onFinished={() => { setReturnPage(null); setCurrentPage(localStorage.getItem('userRole') === 'member' ? 'member-portal' : 'home'); }} />}
          {currentPage === 'stores' && <StoreLocator onBack={() => setCurrentPage(returnPage || 'home')} onOpenShop={openShop} />}
          
          {/* Member Portal */}
          {(currentPage === 'member-portal' || (currentPage === 'pro-portal' && userRole === 'member')) && (
            <MemberPortal onLogout={handleLogout} onNavigate={handleNavigateFromMember} />
          )}

          {/* PRO Portal - Show different dashboard based on userRole */}
          {currentPage === 'pro-portal' && userRole === 'employer' && (
            <EmployerDashboard onBack={handleLogout} onNavigate={(page) => handleNavigate(page)} />
          )}
          {currentPage === 'pro-portal' && userRole === 'employee' && (
            <EmployeeDashboard onBack={handleLogout} onNavigate={(page) => handleNavigate(page)} />
          )}
          {currentPage === 'pro-portal' && userRole === 'admin' && adminView === 'company' && (
            <EmployerDashboard onBack={handleLogout} onNavigate={(page) => handleNavigate(page)} onAdminPanel={() => switchAdminView('admin')} />
          )}
          {currentPage === 'pro-portal' && userRole === 'admin' && adminView !== 'company' && (
            <MondoAdmin onBack={handleLogout} onNavigate={(page) => handleNavigate(page)} onCompanyPortal={() => switchAdminView('company')} />
          )}
          {currentPage === 'pro-portal' && !userRole && isDemo && (
            <ProPortal
              onBack={handleLogout}
              onRoleSelect={handleRoleSelect}
            />
          )}
          {currentPage === 'pro-portal' && !userRole && !isDemo && (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8" style={{ background: T.pageBg }}>
              <WaterBackground />
              <div className="relative z-10 w-full max-w-md">
                <div className="p-10 rounded-[32px] backdrop-blur-xl text-center" style={{
                  background: T.cardBg,
                  border: T.cardBorder,
                  boxShadow: T.cardShadow
                }}>
                  <h2 className="text-3xl font-bold mb-4">Nema pristupa</h2>
                  <p className="text-sm mb-8" style={{ color: T.faint }}>
                    Vaš račun nema dodijeljenu ulogu u profesionalnom portalu. Javite se nositelju svoje tvrtke ili Mondo Acqui.
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-5 text-lg font-bold flex items-center justify-center gap-3 rounded-2xl transition-all relative overflow-hidden group text-black"
                    style={{
                      background: T.accent,
                      boxShadow: '0 8px 30px rgba(79,195,240,0.35)'
                    }}
                  >
                    <span>Odjava</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Recovery Overlay */}
          {showPasswordRecovery && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-8" style={{ background: T.pageBg }}>
              <WaterBackground />
              <div className="relative z-10 w-full max-w-md">
                <div className="p-10 rounded-[32px] backdrop-blur-xl" style={{
                  background: T.cardBg,
                  border: T.cardBorder,
                  boxShadow: T.cardShadow
                }}>
                  <h2 className="text-3xl font-bold mb-8">Nova lozinka</h2>
                  {recoverySuccess ? (
                    <div className="p-4 rounded-xl text-sm" style={{
                      background: 'rgba(52, 199, 89, 0.1)',
                      border: '1px solid rgba(52, 199, 89, 0.3)',
                      color: '#34C759'
                    }}>
                      Lozinka je promijenjena. Prijavite se novom lozinkom.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-semibold tracking-widest mb-3 block" style={{ color: T.faint }}>
                          NOVA LOZINKA
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]"
                          placeholder="Najmanje 8 znakova"
                          style={{
                            background: T.inputBg,
                            border: T.inputBorder,
                            fontSize: '16px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold tracking-widest mb-3 block" style={{ color: T.faint }}>
                          POTVRDITE LOZINKU
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]"
                          placeholder="Ponovite lozinku"
                          style={{
                            background: T.inputBg,
                            border: T.inputBorder,
                            fontSize: '16px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      {recoveryError && (
                        <div className="p-4 rounded-xl text-sm" style={{
                          background: 'rgba(255, 59, 48, 0.1)',
                          border: '1px solid rgba(255, 59, 48, 0.3)',
                          color: '#FF3B30'
                        }}>
                          {recoveryError}
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={recoveryLoading}
                        onClick={handlePasswordRecoverySave}
                        className="w-full py-5 text-lg font-bold flex items-center justify-center gap-3 rounded-2xl transition-all relative overflow-hidden text-black"
                        style={{
                          background: T.accent,
                          boxShadow: '0 8px 30px rgba(79,195,240,0.35)',
                          opacity: recoveryLoading ? 0.7 : 1
                        }}
                      >
                        {recoveryLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            <span>Spremanje...</span>
                          </>
                        ) : (
                          <span>Spremi novu lozinku</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Home/Portal Button - Show only when NOT on home, login, register, promo, analysis, products, free-portal, pro-portal (they have their own back buttons) */}
          {!['home', 'login', 'register', 'member-register', 'promo', 'analysis', 'products', 'free-portal', 'pro-portal', 'member-portal', 'shop', 'visualizer'].includes(currentPage) && (
            <button
              onClick={() => {
                if (returnPage) {
                  const target = returnPage;
                  setReturnPage(null);
                  setCurrentPage(target);
                } else {
                  setCurrentPage('home');
                }
              }}
              className="fixed top-8 right-8 z-50 group"
              title={returnPage ? 'Moj portal' : 'Natrag na početnu'}
            >
              <div className="glass-card px-6 py-4 flex items-center gap-3 hover:scale-105 transition-transform">
                <Home className="w-6 h-6" style={{ color: T.cyan }} />
                <span className="font-semibold">{returnPage ? 'Moj portal' : 'Početna'}</span>
              </div>
            </button>
          )}
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}