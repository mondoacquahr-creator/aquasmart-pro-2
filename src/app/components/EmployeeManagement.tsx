import { UserPlus, Search, Edit, Trash2, Phone, Mail, MapPin, Calendar, Check, X, Users, Award, TrendingUp, Clock, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../lib/languageContext';
import { employeeStorage, Employee } from '../lib/employeeStorage';
import { workOrderStorage } from '../lib/storage';
import { NavigationHeader } from './NavigationHeader';

export function EmployeeManagement() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
    password: '', // New field for creating user
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeStorage.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      let newEmployee;

      // Mock success for demo
      newEmployee = {
        id: 'emp_' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        password: formData.password, // Spremamo lozinku samo za potrebe demo simulacije prijave
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Save to local storage
      const currentLocal = JSON.parse(localStorage.getItem('employees') || '[]');
      const updatedLocal = [...currentLocal, newEmployee];
      localStorage.setItem('employees', JSON.stringify(updatedLocal));
      setEmployees(updatedLocal);

      toast.success(`Djelatnik ${formData.name} je uspješno kreiran i dodan u sustav.`);
      setShowAddForm(false);
      setFormData({ name: '', phone: '', email: '', position: '', password: '' });
    } catch (err: any) {
      toast.error(`Greška pri kreiranju djelatnika: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Jeste li sigurni da želite obrisati djelatnika "${name}"? Pristup sustavu će mu biti onemogućen.`)) {
      try {
        const currentLocal = JSON.parse(localStorage.getItem('employees') || '[]');
        const updatedLocal = currentLocal.filter((emp: any) => emp.id !== id);
        localStorage.setItem('employees', JSON.stringify(updatedLocal));
        setEmployees(updatedLocal);
        toast.success('Djelatnik obrisan.');
      } catch (err) {
        toast.error('Greška pri brisanju.');
      }
    }
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', position: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER */}
      <NavigationHeader title={t('employeeManagement.title')} backUrl="/app" />

      <div className="max-w-4xl mx-auto p-4">
        {/* ADD BUTTON */}
        <button
          onClick={() => {
            if (showAddForm && editingId) {
              cancelEdit();
            }
            setShowAddForm(!showAddForm);
          }}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 rounded-xl hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 flex items-center justify-center gap-2 mb-6 shadow-lg shadow-amber-500/30"
        >
          <PlusCircle className="w-5 h-5" />
          Dodaj djelatnika
        </button>

        {/* ADD/EDIT FORM */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-6 mb-6 space-y-4">
            <h3 className="text-lg font-medium text-amber-500 mb-4">
              Novi djelatnik
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              Djelatnik će dobiti pristup zajedničkom radnom prostoru i moći će vidjeti sve klijente i bazene tvrtke.
            </p>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Ime i prezime *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Lozinka za djelatnika *</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                    placeholder="Min. 8 znakova"
                    required
                    minLength={8}
                  />
                  <Key className="absolute right-3 top-3.5 w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Telefon *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Pozicija</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                  placeholder="npr. Terenski tehničar"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-3 rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Spremi i Kreiraj Račun
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Odustani
              </button>
            </div>
          </form>
        )}

        {/* EMPLOYEES LIST */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nema dodanih djelatnika</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 flex items-start justify-between gap-3 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">{employee.name}</h3>
                  <div className="space-y-1 text-sm text-slate-400">
                    <div>📞 {employee.phone}</div>
                    {employee.email && <div>✉️ {employee.email}</div>}
                    {employee.position && (
                      <div className="text-amber-500 font-medium mt-2">
                        {employee.position}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(employee.id, employee.name)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Obriši"
                  >
                    <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}