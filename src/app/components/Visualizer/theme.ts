export type ProjectType = 'interior' | 'exterior';

export interface ThemeColors {
  bgGradient: string;
  bgOrb1: string;
  bgOrb2: string;
  iconGradient: string;
  iconShadow: string;
  textGradient: string;
  buttonGradient: string;
  buttonShadow: string;
  accentColor: string;
  accentLight: string;
  accentShadow: string;
  ringColor: string;
  borderColor: string;
  goldAccent: string;
  goldGradient: string;
  goldShadow: string;
  goldBorder: string;
}

export function getThemeColors(projectType: ProjectType): ThemeColors {
  const isExterior = projectType === 'exterior';

  return {
    bgGradient: isExterior
      ? 'bg-gradient-to-br from-sky-400 via-blue-600 to-blue-950'
      : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950',
    bgOrb1: isExterior ? 'bg-amber-500/20' : 'bg-indigo-500/20',
    bgOrb2: isExterior ? 'bg-yellow-500/20' : 'bg-purple-500/20',
    iconGradient: isExterior
      ? 'from-amber-400 to-yellow-500'
      : 'from-indigo-500 to-purple-600',
    iconShadow: isExterior ? 'shadow-amber-500/50' : 'shadow-indigo-500/50',
    textGradient: isExterior
      ? 'from-amber-200 to-yellow-400'
      : 'from-white to-indigo-200',
    buttonGradient: isExterior
      ? 'from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500'
      : 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
    buttonShadow: isExterior
      ? 'shadow-amber-500/50 hover:shadow-amber-400/70'
      : 'shadow-indigo-500/50 hover:shadow-indigo-500/70',
    accentColor: isExterior ? 'amber' : 'indigo',
    accentLight: isExterior ? 'yellow' : 'purple',
    accentShadow: isExterior ? 'shadow-amber-500/50' : 'shadow-indigo-500/50',
    ringColor: isExterior ? 'ring-amber-500' : 'ring-indigo-500',
    borderColor: isExterior ? 'border-amber-500/40' : 'border-indigo-500',
    goldAccent: 'amber',
    goldGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    goldShadow: 'shadow-amber-500/60',
    goldBorder: 'border-amber-500/50',
  };
}