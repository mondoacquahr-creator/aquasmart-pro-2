import { supabase } from './supabase';

export async function vizInvoke(path: string, options: { method?: string; body?: any; isFormData?: boolean } = {}) {
  const { method = 'GET', body, isFormData = false } = options;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const headers: Record<string, string> = {};
  if (!isFormData && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const { data, error } = await supabase.functions.invoke('aquasmart-viz' + cleanPath, {
      method,
      body,
      headers,
    });

    if (error) {
      const responseStatus = (error as any).context instanceof Response
        ? (error as any).context.status
        : (error as any).status;
      let contextError: string | null = null;
      if ((error as any).context instanceof Response) {
        try {
          const errorBody = await (error as any).context.json();
          if (typeof errorBody?.error === 'string') {
            contextError = errorBody.error;
          }
        } catch {
          // fall through
        }
      }
      let errorMessage = 'Nepoznata greška na serveru';
      if (typeof error === 'object') {
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
    throw err;
  }
}

export type Pool = {
  id: string;
  name: string;
  type: string;
  shape: string;
  dimensions: string;
  description: string;
  images: string[];
  active: boolean;
};

export const getCatalog = () => vizInvoke('/catalog/pools');
export const visualize = (payload: any) => vizInvoke('/visualize', { method: 'POST', body: payload });
export const sendInquiry = (payload: any) => vizInvoke('/visualize/inquiry', { method: 'POST', body: payload });
export const adminGetCatalog = () => vizInvoke('/admin/catalog/pools');
export const adminSavePool = (pool: any) => vizInvoke('/admin/catalog/pools', { method: 'POST', body: pool });
export const adminDeletePool = (id: string) => vizInvoke('/admin/catalog/pools/' + id, { method: 'DELETE' });
export const adminUploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return vizInvoke('/admin/catalog/upload', { method: 'POST', body: formData, isFormData: true });
};
export const adminGetInquiries = () => vizInvoke('/admin/viz-inquiries');
