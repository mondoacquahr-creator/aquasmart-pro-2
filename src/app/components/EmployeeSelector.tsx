import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, ArrowRight, UserCircle, LogOut } from 'lucide-react';
import { storage } from '../lib/storage';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export function EmployeeSelector() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    // Load employees from localStorage
    const saved = localStorage.getItem('employees');
    if (saved) {
      setEmployees(JSON.parse(saved));
    }
  }, []);

  const handleSelectEmployee = (employee: Employee) => {
    // Save selected employee ID to localStorage
    localStorage.setItem('currentEmployeeId', employee.id);
    localStorage.setItem('currentEmployeeName', employee.name);
    
    // Navigate to home
    navigate('/app');
  };

  const handleLogout = async () => {
    // Clear employee selection
    localStorage.removeItem('currentEmployeeId');
    localStorage.removeItem('currentEmployeeName');
    // Logout the user and navigate to role selection
    await logout();
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Odaberi djelatnika</h1>
            <p className="text-blue-100">Klikni na svoje ime za nastavak</p>
          </motion.div>
        </div>
      </div>

      {/* EMPLOYEE LIST */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {employees.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center"
          >
            <UserCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nema djelatnika</h3>
            <p className="text-slate-400">Poslodavac još nije dodao djelatnike.</p>
          </motion.div>
        ) : (
          employees.map((employee, index) => (
            <motion.button
              key={employee.id}
              onClick={() => handleSelectEmployee(employee)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-6 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white mb-1">{employee.name}</div>
                    <div className="text-sm text-slate-400">{employee.email}</div>
                    {employee.phone && (
                      <div className="text-sm text-slate-500">{employee.phone}</div>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-blue-400 group-hover:text-blue-300"
                >
                  <ArrowRight className="w-8 h-8" />
                </motion.div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-6 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                <LogOut className="w-12 h-12" />
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-1">Odjava</div>
                <div className="text-sm text-slate-400">Napusti aplikaciju</div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}