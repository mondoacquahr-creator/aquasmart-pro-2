import { MondoLogo } from './MondoLogo';

interface AquaSmartProLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'employer' | 'employee';
}

// Logo u portalima poslodavca i izvršitelja: Mondo Acqua Pool Care
export function AquaSmartProLogo({ size = 'md' }: AquaSmartProLogoProps) {
  const px = { sm: 30, md: 40, lg: 52, xl: 68 }[size];
  return <MondoLogo size={px} compact={size === 'sm'} />;
}
