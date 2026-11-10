import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

export type ApiErrorKind = 'auth' | 'other';

export function getApiErrorKind(error: any): ApiErrorKind {
  const status = Number(error?.status ?? error?.context?.status ?? error?.cause?.status);
  const message = String(error?.message || error || '').toLowerCase();
  return status === 401
    || status === 403
    || message.includes('unauthorized')
    || message.includes('forbidden')
    || message.includes('samo mondo acqua admin')
    || message.includes('nemate ovlasti')
    ? 'auth'
    : 'other';
}

export const api = {
  async invoke(resource: string, options: { method?: string; body?: any; isFormData?: boolean } = {}) {
    const { method = 'GET', body, isFormData = false } = options;
    const cleanResource = resource.startsWith('/') ? resource : `/${resource}`;
    
    const headers: Record<string, string> = {};
    if (!isFormData && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('make-server-381f82bd' + cleanResource, {
        method,
        body,
        headers,
      });

      if (error) {
        console.error(`API Error (${resource}):`, error);
        const responseStatus = (error as any).context instanceof Response
          ? (error as any).context.status
          : (error as any).status;

        // Try to extract a structured error message from the response body
        let contextError: string | null = null;
        if ((error as any).context instanceof Response) {
          try {
            const body = await (error as any).context.json();
            if (typeof body?.error === 'string') {
              contextError = body.error;
            }
          } catch {
            // fall through to default handling
          }
        }

        // Handle specific error cases
        let errorMessage = 'Nepoznata greška na serveru';
        if (typeof error === 'object') {
          // Edge function errors can be objects with message or status
          errorMessage = (error as any).message || JSON.stringify(error);
        } else {
          errorMessage = String(error);
        }

        const apiError = new Error(contextError || errorMessage) as Error & { status?: number };
        apiError.status = responseStatus;
        throw apiError;
      }

      return data;
    } catch (err: any) {
      console.error(`Network or runtime error in API (${resource}):`, err);
      throw err;
    }
  },

  async get(resource: string) {
    return this.invoke(resource, { method: 'GET' });
  },

  async post(resource: string, data: any) {
    return this.invoke(resource, { method: 'POST', body: data });
  },

  async delete(resource: string, id: string) {
    return this.invoke(`${resource}/${id}`, { method: 'DELETE' });
  },

  async syncAll() {
    return this.invoke('/sync', { method: 'GET' });
  },

  async uploadImage(file: File, path?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (path) formData.append('path', path);

    return this.invoke('/images/upload', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  async sendNotification(notification: any) {
    return this.invoke('/notifications/send', { method: 'POST', body: notification });
  },

  async getImageUrl(path: string) {
    return this.invoke(`/images/url?path=${encodeURIComponent(path)}`, { method: 'GET' });
  }
};

export const syncData = async () => {
  try {
    // 1. First check if we are online
    if (!navigator.onLine) {
      console.log('Skipping sync: Offline');
      return;
    }

    // 2. Check for active session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    if (!session) {
      console.log('Skipping sync: No active Supabase session (User might be in Demo mode or session expired)');
      return;
    }

    const user = session.user;
    console.log('🔄 Starting sync for user:', user.email);

    // 4. Fetch all from server
    const remoteData = await api.syncAll().catch(err => {
      console.warn('Could not fetch remote data during sync:', err);
      return null;
    });
    
    if (!remoteData) return false;

    // 5. Reconciliation (remote wins)
    const pools = remoteData?.pools || [];
    const clients = remoteData?.clients || [];
    const analyses = remoteData?.analyses || [];
    const workOrders = remoteData?.['work-orders'] || [];
    const warehouseItems = remoteData?.warehouse || [];
    const warehouseTransactions = remoteData?.['warehouse-transactions'] || [];

    if (pools.length > 0) localStorage.setItem('poolapp_pools', JSON.stringify(pools));
    if (clients.length > 0) localStorage.setItem('poolapp_clients', JSON.stringify(clients));
    if (analyses.length > 0) localStorage.setItem('poolapp_analyses', JSON.stringify(analyses));
    if (workOrders.length > 0) localStorage.setItem('workOrders', JSON.stringify(workOrders));
    if (warehouseItems.length > 0) localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
    if (warehouseTransactions.length > 0) localStorage.setItem('warehouseTransactions', JSON.stringify(warehouseTransactions));
    
    console.log('✅ Sync complete');
    return true;
  } catch (err: any) {
    // Only log the error, don't throw if it's just a sync failure to avoid breaking the UI
    console.error('❌ Sync failed:', err);
    return false;
  }
};
