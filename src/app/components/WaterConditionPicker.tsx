import { Check } from 'lucide-react';

interface WaterConditionPickerProps {
  selected: string[];
  onChange: (conditions: string[]) => void;
}

const CONDITIONS = [
  { id: 'bistra', label: '💎 Bistra', color: 'from-blue-400 to-cyan-400' },
  { id: 'zamucena', label: '🌫️ Zamućena', color: 'from-gray-400 to-slate-400' },
  { id: 'bjeljkasta', label: '⚪ Bjeljkasta', color: 'from-gray-300 to-zinc-300' },
  { id: 'zelena', label: '🟢 Zelena', color: 'from-green-400 to-emerald-500' },
  { id: 'smedja', label: '🟤 Smeđa', color: 'from-amber-600 to-orange-700' },
  { id: 'dno-prljavo', label: '🧹 Dno prljavo', color: 'from-yellow-600 to-amber-600' },
  { id: 'zidovi-prljavi', label: '🧼 Zidovi prljavi', color: 'from-orange-500 to-red-500' },
  { id: 'linija-zuta', label: '📏 Vidljiva žuta linija', color: 'from-yellow-400 to-yellow-500' },
];

export function WaterConditionPicker({ selected, onChange }: WaterConditionPickerProps) {
  const toggleCondition = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(c => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Vizualno stanje vode</h3>
        <p className="text-sm text-gray-600">Odaberite sve primjetne karakteristike</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CONDITIONS.map(condition => {
          const isSelected = selected.includes(condition.id);
          
          return (
            <button
              key={condition.id}
              onClick={() => toggleCondition(condition.id)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-teal-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`w-full h-16 bg-gradient-to-br ${condition.color} rounded-lg mb-3 shadow-md`}></div>
              <div className="text-sm font-semibold text-gray-900">{condition.label}</div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-200">
          <div className="text-sm font-semibold text-teal-900 mb-1">Odabrano:</div>
          <div className="flex flex-wrap gap-2">
            {selected.map(id => {
              const condition = CONDITIONS.find(c => c.id === id);
              return condition ? (
                <span key={id} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  {condition.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
