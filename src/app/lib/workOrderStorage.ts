import { WorkOrder, Issue } from '../types';

const WORK_ORDERS_KEY = 'workOrders'; // Changed from 'aquasmart_work_orders' to match existing data
const ISSUES_KEY = 'aquasmart_issues';

// Work Orders Storage
export const workOrderStorage = {
  getAll(): WorkOrder[] {
    try {
      const data = localStorage.getItem(WORK_ORDERS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(i => i !== null) : [];
    } catch (e) {
      console.error('Error reading work orders:', e);
      return [];
    }
  },

  getById(id: string): WorkOrder | undefined {
    return this.getAll().find(wo => wo.id === id);
  },

  getByPoolId(poolId: string): WorkOrder[] {
    return this.getAll().filter(wo => wo.poolId === poolId);
  },

  getByClientId(clientId: string): WorkOrder[] {
    return this.getAll().filter(wo => wo.clientId === clientId);
  },

  save(workOrder: WorkOrder): void {
    const workOrders = this.getAll();
    const index = workOrders.findIndex(wo => wo.id === workOrder.id);
    
    if (index >= 0) {
      workOrders[index] = workOrder;
    } else {
      workOrders.push(workOrder);
    }
    
    localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(workOrders));
  },

  delete(id: string): void {
    const workOrders = this.getAll().filter(wo => wo.id !== id);
    localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(workOrders));
  },

  clear(): void {
    localStorage.removeItem(WORK_ORDERS_KEY);
  }
};

// Issues Storage
export const issueStorage = {
  getAll(): Issue[] {
    try {
      const data = localStorage.getItem(ISSUES_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(i => i !== null) : [];
    } catch (e) {
      console.error('Error reading issues:', e);
      return [];
    }
  },

  getById(id: string): Issue | undefined {
    return this.getAll().find(issue => issue.id === id);
  },

  getByPoolId(poolId: string): Issue[] {
    return this.getAll().filter(issue => issue.poolId === poolId);
  },

  getByClientId(clientId: string): Issue[] {
    return this.getAll().filter(issue => issue.clientId === clientId);
  },

  getOpenIssues(): Issue[] {
    return this.getAll().filter(issue => issue.status !== 'resolved');
  },

  save(issue: Issue): void {
    const issues = this.getAll();
    const index = issues.findIndex(i => i.id === issue.id);
    
    if (index >= 0) {
      issues[index] = issue;
    } else {
      issues.push(issue);
    }
    
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  },

  delete(id: string): void {
    const issues = this.getAll().filter(i => i.id !== id);
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  },

  clear(): void {
    localStorage.removeItem(ISSUES_KEY);
  }
};