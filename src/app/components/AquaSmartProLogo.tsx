import { Droplets } from 'lucide-react';

interface AquaSmartProLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'employer' | 'employee';
}

export function AquaSmartProLogo({ size = 'md', variant = 'employer' }: AquaSmartProLogoProps) {
  const accentColor = variant === 'employer' ? '#D4A853' : '#00F0FF';
  
  const sizes = {
    sm: { icon: 10, text: 'text-sm', banner: 'text-[8px]', gap: 'gap-2', padding: 'p-1.5' },
    md: { icon: 15, text: 'text-xl', banner: 'text-xs', gap: 'gap-3', padding: 'p-2' },
    lg: { icon: 20, text: 'text-3xl', banner: 'text-sm', gap: 'gap-4', padding: 'p-2.5' },
    xl: { icon: 30, text: 'text-5xl', banner: 'text-base', gap: 'gap-6', padding: 'p-3' },
  };

  const config = sizes[size];

  return (
    <div className={`flex flex-col items-center ${config.gap}`}>
      {/* Droplets Icon sa gradient kvadratom */}
      <div 
        className={`${config.padding} rounded-lg`}
        style={{
          background: variant === 'employer' 
            ? 'linear-gradient(135deg, #8B0000 0%, #B8860B 50%, #996515 100%)'
            : 'linear-gradient(135deg, #008B8B 0%, #1E90FF 50%, #0080C0 100%)',
        }}
      >
        <Droplets 
          size={config.icon} 
          strokeWidth={2}
          style={{ color: '#FFFFFF' }}
        />
      </div>

      {/* ACQUASMART PRO Text - SREDINA */}
      <h1 className={`font-bold ${config.text} leading-none tracking-tight`}>
        <span className="text-white">ACQUA</span>
        <span 
          className="bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage: variant === 'employer' 
              ? 'linear-gradient(135deg, #DC143C 0%, #FFD700 50%, #D4A853 100%)'
              : 'linear-gradient(135deg, #00F0FF 0%, #4A9FD8 50%, #00D4FF 100%)'
          }}
        >
          SMART
        </span>
        {' '}
        <span className="text-white">PRO</span>
      </h1>

      {/* Next Generation Banner - ISPOD sa gradientom */}
      <div 
        className={`${config.banner} font-semibold tracking-wider bg-gradient-to-r bg-clip-text text-transparent`}
        style={{
          backgroundImage: variant === 'employer' 
            ? 'linear-gradient(135deg, #DC143C 0%, #FFD700 50%, #D4A853 100%)'
            : 'linear-gradient(135deg, #00F0FF 0%, #4A9FD8 50%, #00D4FF 100%)'
        }}
      >
        NEXT GENERATION POOL MANAGEMENT
      </div>
    </div>
  );
}