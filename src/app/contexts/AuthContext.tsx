import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials, RegisterData } from '../lib/auth';
import { syncData } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

// Create context with a proper default value instead of undefined
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isGuest: false,
  login: async () => { throw new Error('AuthProvider not initialized'); },
  register: async () => { throw new Error('AuthProvider not initialized'); },
  logout: async () => { throw new Error('AuthProvider not initialized'); },
  continueAsGuest: () => { throw new Error('AuthProvider not initialized'); },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // Provjeri postoji li korisnik pri učitavanju
      const currentUser = authService.getCurrentUser();
      const guestUser = authService.getGuestSession();
      
      if (currentUser) {
        setUser(currentUser);
        // Sync data on app start (don't block UI)
        syncData().catch(err => console.error('Sync failed on init:', err));
      } else if (guestUser) {
        setUser(guestUser);
      }
      
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const user = await authService.login(credentials);
    setUser(user);
    // Sync data after login (don't block UI)
    syncData().catch(err => console.error('Sync failed after login:', err));
    return user;
  };

  const register = async (data: RegisterData) => {
    const user = await authService.register(data);
    setUser(user);
    // Sync data after register (don't block UI)
    syncData().catch(err => console.error('Sync failed after register:', err));
    return user;
  };

  const logout = async () => {
    // 1. Odmah očisti lokalni state da UI reagira trenutno
    setUser(null);
    
    // 2. Brišemo samo specifične ključeve povezane sa sesijom, ne cijeli localStorage
    // kako bismo sačuvali demo podatke (djelatnike, klijente, itd.) za simulaciju
    const keysToRemove = [
      'aquasmart_auth',
      'userRole',
      'selectedEmployee',
      'aquasmart_cart',
      'currentEmployeeId',
      'currentEmployeeName',
      'isDemo',
      'userPermissions'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem('guest_session');
    
    // 3. Pokušaj odjavu na serveru u pozadini
    try {
      authService.logout().catch(err => console.error('Silent logout error:', err));
    } catch (e) {
      // Ignoriraj
    }
    
    // 4. Prisilno preusmjeri na početak
    window.location.replace('/?logout=' + Date.now());
  };

  const continueAsGuest = () => {
    const guestUser = authService.createGuestSession();
    setUser(guestUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && user.role !== 'guest',
    isGuest: authService.isGuest(user),
    login,
    register,
    logout,
    continueAsGuest,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030213] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gold-500 font-medium tracking-widest uppercase text-xs">Učitavam AcquaSmart Pro...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Context now always has a value (either default or actual)
  return context;
}