import { Check, ChevronRight } from 'lucide-react';

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
  { id: 'object-gallery', label: 'Odaberi objekt', number: 3 },
  { id: 'object-crop', label: 'Izreži objekt', number: 4 },
  { id: 'design-canvas', label: 'Postavi objekt', number: 5 },
];

export function StepNavigation({ currentStep, completedSteps, projectType = 'interior', onNavigate }: StepNavigationProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Dynamic colors based on project type
  const currentStepGradient = projectType === 'exterior' 
    ? 'from-blue-500 to-sky-600 shadow-blue-500/50 ring-blue-400/30'
    : 'from-indigo-500 to-purple-600 shadow-indigo-500/50 ring-indigo-400/30';

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
    <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 hover-spring shadow-2xl">
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isClickable = canNavigateTo(step.id) && step.id !== currentStep;

          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => isClickable && onNavigate(step.id)}
                disabled={!isClickable}
                className={`flex items-center gap-3 transition-all gpu-accelerated ${
                  isClickable
                    ? 'cursor-pointer hover:scale-110 hover-spring'
                    : status === 'current'
                    ? 'cursor-default'
                    : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      status === 'completed'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                        : status === 'current'
                        ? `bg-gradient-to-br ${currentStepGradient} text-white shadow-lg ring-4`
                        : 'bg-white/10 text-white/50 border border-white/20'
                    }`}
                  >
                    {status === 'completed' ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="text-left hidden md:block">
                    <div
                      className={`text-xs font-medium ${
                        status === 'upcoming' ? 'text-white/40' : 'text-white/60'
                      }`}
                    >
                      Korak {step.number}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        status === 'current'
                          ? 'text-white'
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
                <ChevronRight className="w-5 h-5 text-white/30 mx-2 md:mx-4 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step name */}
      <div className="md:hidden mt-4 text-center">
        <div className="text-xs text-white/60">Korak {currentStepIndex + 1} od {steps.length}</div>
        <div className="text-sm font-semibold text-white mt-1">
          {steps[currentStepIndex]?.label}
        </div>
      </div>
    </div>
  );
}