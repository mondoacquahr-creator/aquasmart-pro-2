import { Check, ChevronRight } from 'lucide-react';
import { getThemeColors, ProjectType } from '../utils/theme';

interface Step {
  id: string;
  label: string;
  number: number;
}

interface StepNavigationProps {
  currentStep: string;
  completedSteps: string[];
  projectType?: 'interior' | 'exterior' | null;
  onNavigate: (step: string) => void;
}

const steps: Step[] = [
  { id: 'photo-upload', label: 'Učitaj prostor', number: 1 },
  { id: 'photo-edit', label: 'Uredi prostor', number: 2 },
  { id: 'object-upload', label: 'Učitaj objekt', number: 3 },
  { id: 'object-crop', label: 'Izreži objekt', number: 4 },
  { id: 'design-canvas', label: 'Postavi objekt', number: 5 },
];

export function StepNavigation({ currentStep, completedSteps, projectType = 'exterior', onNavigate }: StepNavigationProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const theme = getThemeColors(projectType as ProjectType);
  const isExterior = projectType === 'exterior';

  const canNavigateTo = (stepId: string) => {
    return completedSteps.includes(stepId);
  };

  const getStepStatus = (step: Step, index: number) => {
    if (step.id === currentStep) return 'current';
    if (completedSteps.includes(step.id)) return 'completed';
    if (index < currentStepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className={`bg-black/40 backdrop-blur-lg border rounded-2xl p-4 md:p-6 ${
      isExterior 
        ? 'border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
        : 'border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
    }`}>
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isClickable = canNavigateTo(step.id) && step.id !== currentStep;

          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => isClickable && onNavigate(step.id)}
                disabled={!isClickable}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isClickable
                    ? 'cursor-pointer hover:scale-110'
                    : status === 'current'
                    ? 'cursor-default'
                    : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      status === 'completed'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                        : status === 'current'
                        ? isExterior
                          ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/60 ring-4 ring-amber-400/30'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/60 ring-4 ring-indigo-400/30'
                        : 'bg-white/10 text-white/50 border border-white/20'
                    }`}
                  >
                    {status === 'completed' ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="text-left hidden md:block">
                    <div
                      className={`text-xs font-medium ${
                        status === 'upcoming' 
                          ? 'text-white/40' 
                          : isExterior 
                            ? 'text-amber-200/60' 
                            : 'text-indigo-200/60'
                      }`}
                    >
                      Korak {step.number}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        status === 'current'
                          ? isExterior ? 'text-amber-300' : 'text-indigo-300'
                          : status === 'completed'
                          ? 'text-green-300'
                          : 'text-white/50'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              </button>

              {index < steps.length - 1 && (
                <ChevronRight className={`w-5 h-5 mx-2 md:mx-4 flex-shrink-0 ${
                  isExterior ? 'text-amber-500/30' : 'text-indigo-500/30'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step name */}
      <div className="md:hidden mt-4 text-center">
        <div className={`text-xs ${isExterior ? 'text-amber-200/60' : 'text-indigo-200/60'}`}>
          Korak {currentStepIndex + 1} od {steps.length}
        </div>
        <div className={`text-sm font-semibold mt-1 ${
          isExterior ? 'text-amber-300' : 'text-indigo-300'
        }`}>
          {steps[currentStepIndex]?.label}
        </div>
      </div>
    </div>
  );
}