// Analytics storage for water analysis history
// This file stores all analysis data for professionals to track trends

export interface AnalyticsEntry {
  id: string;
  timestamp: string;
  clientId?: string;
  clientName?: string;
  poolId?: string;
  poolName?: string;
  poolVolume: number;
  parameters: {
    pH?: number;
    freeChlorine?: number;
    alkalinity?: number;
    hardness?: number;
    temperature?: number;
    orp?: number;
  };
  status: 'ok' | 'warning' | 'critical';
  recommendations: Array<{
    productName: string;
    quantity: number;
    unit: string;
    category?: string;
  }>;
  treatmentCost?: number;
  source: 'manual' | 'visual-test' | 'import';
}

const ANALYTICS_STORAGE_KEY = 'aquasmart_analytics';

class AnalyticsStorage {
  // Get all analytics entries
  getAll(): AnalyticsEntry[] {
    const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save new analytics entry
  save(entry: AnalyticsEntry): void {
    const entries = this.getAll();
    entries.push(entry);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(entries));
  }

  // Get entries for specific client
  getByClient(clientId: string): AnalyticsEntry[] {
    return this.getAll().filter(entry => entry.clientId === clientId);
  }

  // Get entries for specific pool
  getByPool(poolId: string): AnalyticsEntry[] {
    return this.getAll().filter(entry => entry.poolId === poolId);
  }

  // Get entries by date range
  getByDateRange(startDate: string, endDate: string): AnalyticsEntry[] {
    return this.getAll().filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  }

  // Get analytics summary
  getSummary(): {
    totalAnalyses: number;
    byStatus: { ok: number; warning: number; critical: number };
    totalCost: number;
    averagePH: number;
    averageChlorine: number;
  } {
    const entries = this.getAll();
    
    const summary = {
      totalAnalyses: entries.length,
      byStatus: { ok: 0, warning: 0, critical: 0 },
      totalCost: 0,
      averagePH: 0,
      averageChlorine: 0,
    };

    let phSum = 0;
    let phCount = 0;
    let chlorineSum = 0;
    let chlorineCount = 0;

    entries.forEach(entry => {
      summary.byStatus[entry.status]++;
      summary.totalCost += entry.treatmentCost || 0;
      
      if (entry.parameters.pH) {
        phSum += entry.parameters.pH;
        phCount++;
      }
      
      if (entry.parameters.freeChlorine) {
        chlorineSum += entry.parameters.freeChlorine;
        chlorineCount++;
      }
    });

    summary.averagePH = phCount > 0 ? phSum / phCount : 0;
    summary.averageChlorine = chlorineCount > 0 ? chlorineSum / chlorineCount : 0;

    return summary;
  }

  // Export all analytics as JSON
  exportJSON(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  // Clear all analytics (use with caution!)
  clear(): void {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }
}

export const analyticsStorage = new AnalyticsStorage();
