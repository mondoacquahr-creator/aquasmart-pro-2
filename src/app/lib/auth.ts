import { User, UserRole } from '../types';
import { supabase, api } from './supabase';

const STORAGE_KEY = 'aquasmart_auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyName?: string;
  consent?: boolean;
  phone?: string;
  city?: string;
  address?: string;
}

export const authService = {
  // Prijava
  async login(credentials: LoginCredentials): Promise<User> {
    // Demo bypass for testing
    if (credentials.email === 'profesionalac@aquasmart.hr' && credentials.password === 'pro123') {
      const demoUser: User = {
        id: 'demo-prof-id',
        email: 'profesionalac@aquasmart.hr',
        name: 'Demo Profesionalac',
        role: 'professional',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      localStorage.removeItem('userRole');
      localStorage.setItem('isDemo', 'true');
      return demoUser;
    }

    if (credentials.email === 'klijent@gmail.com' && credentials.password === 'klijent123') {
      const demoUser: User = {
        id: 'demo-client-id',
        email: 'klijent@gmail.com',
        name: 'Demo Klijent',
        role: 'client',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    // Check if it's a demo employee created locally
    let savedEmployees = [];
    try {
      savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    } catch (e) {
      savedEmployees = [];
    }
    
    const demoEmployee = savedEmployees.find((emp: any) => 
      emp.email?.toLowerCase() === credentials.email?.toLowerCase() && 
      emp.password === credentials.password
    );

    if (demoEmployee) {
      const empUser: User = {
        id: demoEmployee.id,
        email: demoEmployee.email,
        name: demoEmployee.name,
        role: 'professional', // Employees behave as professionals in the field
        companyId: 'demo-prof-id', // All demo employees belong to the demo company
        createdAt: demoEmployee.createdAt || new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(empUser));
      localStorage.setItem('userRole', 'employee');
      localStorage.setItem('isDemo', 'true');
      localStorage.setItem('userPermissions', JSON.stringify(demoEmployee.permissions || {}));
      return empUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('banned')) {
        throw new Error('Račun je deaktiviran. Javite se nositelju svoje tvrtke.');
      }
      throw new Error(error.message);
    }
    if (!data.user) throw new Error('Prijava nije uspjela');

    const am = data.user.app_metadata || {};
    const meta = data.user.user_metadata || {};

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: meta.name || 'Korisnik',
      role: (meta.role as UserRole) || 'professional',
      companyId: am.companyId || data.user.id,
      companyName: am.companyName || meta.companyName,
      createdAt: data.user.created_at,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    if (meta.demo === true) {
      localStorage.setItem('isDemo', 'true');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userPermissions');
    } else {
      localStorage.removeItem('isDemo');
      let role: string | null = null;
      // Mondo admin određuje poslužitelj (app_metadata.mondoAdmin), ne e-mail ni lozinka u kodu.
      if (am.mondoAdmin === true) {
        role = 'admin';
      } else if (am.role === 'employee') {
        role = 'employee';
      } else if (am.role === 'owner') {
        role = 'employer';
      } else if (am.role === 'member') {
        role = 'member';
      }
      localStorage.setItem('userEmail', data.user.email || '');
      if (role) {
        localStorage.setItem('userRole', role);
      } else {
        localStorage.removeItem('userRole');
      }
      if (am.role === 'employee') {
        localStorage.setItem('userPermissions', JSON.stringify(am.permissions || {}));
      } else {
        localStorage.removeItem('userPermissions');
      }
    }

    return user;
  },

  // Registracija preko servera (za automatski email confirm)
  async register(data: RegisterData): Promise<User> {
    try {
      // Koristimo centralizirani api utility
      await api.post('signup', {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        companyName: data.companyName,
        parentCompanyId: data.role === 'professional' ? null : undefined,
        consent: data.consent,
        phone: data.phone,
        city: data.city,
        address: data.address,
      });

      // Nakon uspješne registracije, prijavljujemo korisnika odmah
      return this.login({
        email: data.email,
        password: data.password
      });
    } catch (error: any) {
      console.error('Registration error details:', error);
      throw error;
    }
  },

  // Dohvati trenutnog korisnika
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to parse auth data', e);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  // Odjava
  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase signOut error:', e);
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedEmployee');
    localStorage.removeItem('aquasmart_cart');
    localStorage.removeItem('currentEmployeeId');
    localStorage.removeItem('currentEmployeeName');
    localStorage.removeItem('isDemo');
    localStorage.removeItem('userPermissions');
    sessionStorage.removeItem('guest_session');
  },

  // Guest session
  createGuestSession(): User {
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      email: 'guest@local',
      name: 'Gost',
      role: 'guest',
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem('guest_session', JSON.stringify(guestUser));
    return guestUser;
  },

  getGuestSession(): User | null {
    try {
      const data = sessionStorage.getItem('guest_session');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  isGuest(user: User | null): boolean {
    return user?.role === 'guest';
  },
};