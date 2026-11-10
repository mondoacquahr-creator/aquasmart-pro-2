export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  location: string;
  performance?: number;
  tasks?: number;
  password?: string;
  createdAt?: string;
}

const STORAGE_KEY = 'employees';

export const employeeStorage = {
  getAll(): Employee[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  },

  save(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employees:', error);
    }
  },

  add(employee: Employee): void {
    const employees = this.getAll();
    employees.push(employee);
    this.save(employees);
  },

  update(id: string, updates: Partial<Employee>): void {
    const employees = this.getAll();
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      this.save(employees);
    }
  },

  delete(id: string): void {
    const employees = this.getAll();
    const filtered = employees.filter(e => e.id !== id);
    this.save(filtered);
  },

  getById(id: string): Employee | undefined {
    return this.getAll().find(e => e.id === id);
  }
};
