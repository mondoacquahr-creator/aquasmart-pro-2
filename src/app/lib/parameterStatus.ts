// Helper function to determine parameter status
export interface ParameterStatus {
  status: 'ok' | 'warning' | 'critical';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const IDEAL_RANGES = {
  pH: { ok: { min: 7.2, max: 7.6 }, warning: { min: 6.8, max: 8.0 } },
  freeChlorine: { ok: { min: 0.5, max: 2.0 }, warning: { min: 0.2, max: 5.0 } },
  alkalinity: { ok: { min: 80, max: 120 }, warning: { min: 60, max: 180 } },
  hardness: { ok: { min: 200, max: 400 }, warning: { min: 150, max: 500 } },
  orp: { ok: { min: 650, max: 750 }, warning: { min: 600, max: 800 } },
};

export function getParameterStatus(
  parameterName: 'pH' | 'freeChlorine' | 'alkalinity' | 'hardness' | 'orp',
  value: number | undefined
): ParameterStatus {
  if (value === undefined) {
    return {
      status: 'ok',
      label: 'N/A',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
    };
  }

  const ranges = IDEAL_RANGES[parameterName];

  // Check if OK
  if (value >= ranges.ok.min && value <= ranges.ok.max) {
    return {
      status: 'ok',
      label: 'U redu ✓',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    };
  }

  // Check if Warning
  if (value >= ranges.warning.min && value <= ranges.warning.max) {
    return {
      status: 'warning',
      label: 'Pažnja ⚡',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    };
  }

  // Critical
  return {
    status: 'critical',
    label: 'Kritično ⚠️',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  };
}