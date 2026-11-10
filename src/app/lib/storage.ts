import { Pool, WaterAnalysis, Client, UserType, Store } from '../types';
import { api } from './supabase';

const STORAGE_KEYS = {
  USER_TYPE: 'poolapp_user_type',
  POOLS: 'poolapp_pools',
  ANALYSES: 'poolapp_analyses',
  CLIENTS: 'poolapp_clients',
  STORES: 'poolapp_stores',
};

export const storage = {
  // User Type
  getUserType(): UserType | null {
    const type = localStorage.getItem(STORAGE_KEYS.USER_TYPE);
    return type as UserType | null;
  },
  
  setUserType(type: UserType) {
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
  },

  // Pools
  getPools(): Pool[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POOLS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error reading pools from storage:', err);
      return [];
    }
  },

  async savePool(pool: Pool) {
    try {
      const pools = this.getPools();
      const index = pools.findIndex(p => p.id === pool.id);
      if (index >= 0) {
        pools[index] = pool;
      } else {
        pools.push(pool);
      }
      localStorage.setItem(STORAGE_KEYS.POOLS, JSON.stringify(pools));
      
      // Remote Sync
      try {
        await api.post('pools', pool);
      } catch (err) {
        console.warn('Remote sync failed for pool:', err);
      }
    } catch (err) {
      console.error('Error saving pool to storage:', err);
    }
  },

  getPool(id: string): Pool | undefined {
    if (!id) return undefined;
    return this.getPools().find(p => p.id === id);
  },

  async updatePool(pool: Pool) {
    await this.savePool(pool);
  },

  async deletePool(id: string) {
    try {
      // Delete all analyses for this pool locally
      const remainingAnalyses = this.getAnalyses().filter(a => a.poolId !== id);
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(remainingAnalyses));
      
      // Delete all work orders for this pool locally
      const workOrdersData = localStorage.getItem('workOrders');
      if (workOrdersData) {
        try {
          const workOrders = JSON.parse(workOrdersData);
          if (Array.isArray(workOrders)) {
            const remainingWorkOrders = workOrders.filter((wo: any) => wo.poolId !== id);
            localStorage.setItem('workOrders', JSON.stringify(remainingWorkOrders));
          }
        } catch (e) {}
      }
      
      // Delete the pool locally
      const pools = this.getPools().filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.POOLS, JSON.stringify(pools));

      // Remote Sync
      try {
        await api.delete('pools', id);
      } catch (err) {
        console.warn('Remote delete failed for pool:', err);
      }
    } catch (err) {
      console.error('Error deleting pool:', err);
    }
  },

  // Analyses
  getAnalyses(poolId?: string): WaterAnalysis[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      if (!data) return [];
      const analyses: WaterAnalysis[] = JSON.parse(data);
      if (!Array.isArray(analyses)) return [];
      return poolId ? analyses.filter(a => a.poolId === poolId) : analyses;
    } catch (err) {
      console.error('Error reading analyses:', err);
      return [];
    }
  },

  async saveAnalysis(analysis: WaterAnalysis) {
    const analyses = this.getAnalyses();
    analyses.push(analysis);
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
    
    // Update pool's last analysis status locally
    const pool = this.getPool(analysis.poolId);
    if (pool) {
      pool.lastAnalysisStatus = analysis.status;
      pool.lastAnalysisDate = analysis.date;
      await this.updatePool(pool);
    }

    // Remote Sync
    try {
      await api.post('analyses', analysis);
    } catch (err) {
      console.warn('Remote sync failed for analysis:', err);
    }
  },

  getAnalysis(id: string): WaterAnalysis | undefined {
    return this.getAnalyses().find(a => a.id === id);
  },

  // Clients
  getClients(): Client[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },

  async saveClient(client: Client) {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.push(client);
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));

    // Remote Sync
    try {
      await api.post('clients', client);
    } catch (err) {
      console.warn('Remote sync failed for client:', err);
    }
  },

  getClient(id: string): Client | undefined {
    return this.getClients().find(c => c.id === id);
  },

  async deleteClient(id: string) {
    // Delete client locally
    const clients = this.getClients().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));

    // Remote Sync
    try {
      await api.delete('clients', id);
    } catch (err) {
      console.warn('Remote delete failed for client:', err);
    }
  },

  // Stores
  getStores(): Store[] {
    const data = localStorage.getItem(STORAGE_KEYS.STORES);
    return data ? JSON.parse(data) : [];
  },

  saveStore(store: Store) {
    const stores = this.getStores();
    const index = stores.findIndex(s => s.id === store.id);
    if (index >= 0) {
      stores[index] = store;
    } else {
      stores.push(store);
    }
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  },

  getStore(id: string): Store | undefined {
    return this.getStores().find(s => s.id === id);
  },

  deleteStore(id: string) {
    const stores = this.getStores().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  },
};
