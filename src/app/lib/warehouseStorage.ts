export interface WarehouseItem {
  id: string;
  name: string;
  category: 'chemical' | 'equipment' | 'spare-part' | 'other';
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  supplier?: string;
  notes?: string;
  lastUpdated: string;
}

export interface WarehouseTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  workOrderId?: string;
  notes?: string;
}

class WarehouseStorage {
  private ITEMS_KEY = 'warehouseItems';
  private TRANSACTIONS_KEY = 'warehouseTransactions';

  // ===== ITEMS =====
  getItems(): WarehouseItem[] {
    try {
      const saved = localStorage.getItem(this.ITEMS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error loading warehouse items:', e);
      return [];
    }
  }

  getItem(id: string): WarehouseItem | undefined {
    return this.getItems().find(item => item.id === id);
  }

  addItem(item: Omit<WarehouseItem, 'id' | 'lastUpdated'>): WarehouseItem {
    const items = this.getItems();
    const newItem: WarehouseItem = {
      ...item,
      id: `warehouse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
    return newItem;
  }

  updateItem(id: string, updates: Partial<WarehouseItem>): void {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
    }
  }

  deleteItem(id: string): void {
    const items = this.getItems().filter(item => item.id !== id);
    localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
  }

  // ===== TRANSACTIONS =====
  getTransactions(): WarehouseTransaction[] {
    try {
      const saved = localStorage.getItem(this.TRANSACTIONS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error loading warehouse transactions:', e);
      return [];
    }
  }

  addTransaction(transaction: Omit<WarehouseTransaction, 'id'>): void {
    const transactions = this.getTransactions();
    const newTransaction: WarehouseTransaction = {
      ...transaction,
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    transactions.push(newTransaction);
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));

    // Update item quantity
    const item = this.getItem(transaction.itemId);
    if (item) {
      const newQuantity = transaction.type === 'in' 
        ? item.quantity + transaction.quantity 
        : item.quantity - transaction.quantity;
      this.updateItem(transaction.itemId, { quantity: Math.max(0, newQuantity) });
    }
  }

  // ===== STOCK MANAGEMENT =====
  getLowStockItems(): WarehouseItem[] {
    return this.getItems().filter(item => item.quantity <= item.minStock);
  }

  // ===== FUZZY MATCHING FOR CHEMICALS =====
  findChemicalByName(searchName: string): WarehouseItem | undefined {
    if (!searchName) return undefined;
    const chemicals = this.getItems().filter(item => item.category === 'chemical');
    
    const normalizedSearch = searchName.toLowerCase().trim();
    
    // 1. Exact match (case insensitive)
    const exactMatch = chemicals.find(c => 
      c.name.toLowerCase().trim() === normalizedSearch
    );
    if (exactMatch) return exactMatch;

    // 2. Exact match after cleaning (remove Ivero, Pool, Plus)
    const cleanSearch = normalizedSearch
      .replace(/ivero/gi, '')
      .replace(/pool/gi, '')
      .replace(/plus/gi, '')
      .replace(/aqua/gi, '')
      .replace(/smart/gi, '')
      .replace(/pro/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanMatch = chemicals.find(c => {
      const cleanName = c.name.toLowerCase()
        .replace(/ivero/gi, '')
        .replace(/pool/gi, '')
        .replace(/plus/gi, '')
        .replace(/aqua/gi, '')
        .replace(/smart/gi, '')
        .replace(/pro/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return cleanName === cleanSearch && cleanSearch.length > 2;
    });
    if (cleanMatch) return cleanMatch;

    // 3. Partial match - search contains item name or vice versa
    const partialMatch = chemicals.find(c => {
      const cleanName = c.name.toLowerCase()
        .replace(/ivero/gi, '')
        .replace(/pool/gi, '')
        .replace(/plus/gi, '')
        .trim();
      return (cleanName.length > 2 && (cleanSearch.includes(cleanName) || cleanName.includes(cleanSearch)));
    });
    if (partialMatch) return partialMatch;

    // 4. First few words match
    const searchWords = cleanSearch.split(' ').filter(w => w.length > 2);
    if (searchWords.length > 0) {
      const wordMatch = chemicals.find(c => {
        const itemWords = c.name.toLowerCase().split(' ');
        return searchWords.some(sw => itemWords.includes(sw));
      });
      if (wordMatch) return wordMatch;
    }

    return undefined;
  }

  // ===== BULK IMPORT FROM EXCEL =====
  importFromExcel(data: any[]): { success: number; failed: number; errors: string[] } {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    data.forEach((row, index) => {
      try {
        // Expected columns: Naziv, Kategorija, Količina, Jedinica, Min. zaliha, Cijena, Dobavljač
        const item = {
          name: row['Naziv'] || row['naziv'] || '',
          category: this.mapCategory(row['Kategorija'] || row['kategorija'] || 'other'),
          quantity: parseFloat(row['Količina'] || row['kolicina'] || '0'),
          unit: row['Jedinica'] || row['jedinica'] || 'kom',
          minStock: parseFloat(row['Min. zaliha'] || row['min_zaliha'] || '0'),
          price: parseFloat(row['Cijena'] || row['cijena'] || '0'),
          supplier: row['Dobavljač'] || row['dobavljac'] || '',
          notes: row['Napomena'] || row['napomena'] || '',
        };

        if (!item.name) {
          throw new Error('Naziv je obavezan');
        }

        this.addItem(item);
        success++;
      } catch (e: any) {
        failed++;
        errors.push(`Red ${index + 2}: ${e.message}`);
      }
    });

    return { success, failed, errors };
  }

  private mapCategory(category: string): WarehouseItem['category'] {
    const cat = category.toLowerCase();
    if (cat.includes('kemikalij') || cat.includes('chemical')) return 'chemical';
    if (cat.includes('oprema') || cat.includes('equipment')) return 'equipment';
    if (cat.includes('rezerv') || cat.includes('spare')) return 'spare-part';
    return 'other';
  }

  // ===== STATISTICS =====
  getConsumptionStats(days: number = 30): { itemId: string; name: string; consumed: number }[] {
    const transactions = this.getTransactions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const consumption: Record<string, { name: string; consumed: number }> = {};

    transactions.forEach(trans => {
      if (trans.type === 'out' && new Date(trans.date) >= cutoffDate) {
        const item = this.getItem(trans.itemId);
        if (item) {
          if (!consumption[trans.itemId]) {
            consumption[trans.itemId] = { name: item.name, consumed: 0 };
          }
          consumption[trans.itemId].consumed += trans.quantity;
        }
      }
    });

    return Object.entries(consumption).map(([itemId, data]) => ({
      itemId,
      ...data,
    })).sort((a, b) => b.consumed - a.consumed);
  }

  // ===== CLEAR ALL DATA =====
  clearAll(): void {
    localStorage.removeItem(this.ITEMS_KEY);
    localStorage.removeItem(this.TRANSACTIONS_KEY);
  }
}

export const warehouseStorage = new WarehouseStorage();
