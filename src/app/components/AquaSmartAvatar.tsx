import { Bot, Droplet, Droplets, Brain, Sparkles, Waves, Cpu, Zap } from 'lucide-react';
import { motion } from 'motion/react';

type AvatarVariant = 'aquabot' | 'smartdrop' | 'waterai' | 'dropbot';

interface AquaSmartAvatarProps {
  variant?: AvatarVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export function AquaSmartAvatar({ 
  variant = 'dropbot', 
  size = 'md', 
  animated = true,
  className = '' 
}: AquaSmartAvatarProps) {
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const subIconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const baseClass = `${sizeClasses[size]} ${className}`;

  // Animation variants
  const containerAnimation = animated ? {
    animate: {
      rotate: [0, 5, 0, -5, 0],
      scale: [1, 1.05, 1],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  const glowAnimation = animated ? {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  // AquaBot - Robot with water drops
  if (variant === 'aquabot') {
    return (
      <motion.div 
        className={`${baseClass} relative`}
        {...containerAnimation}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl blur-lg"
          {...glowAnimation}
        />
        
        {/* Main container */}
        <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-teal-300/30">
          {/* Robot head */}
          <div className="relative">
            <Bot className={`${iconSizes[size]} text-white`} />
            {/* Water drops */}
            <Droplet className={`${subIconSizes[size]} text-cyan-200 absolute -top-1 -right-1`} />
            <Sparkles className={`${subIconSizes[size]} text-yellow-300 absolute -bottom-0.5 -left-0.5`} />
          </div>
        </div>
      </motion.div>
    );
  }

  // SmartDrop - Water drop with AI brain
  if (variant === 'smartdrop') {
    return (
      <motion.div 
        className={`${baseClass} relative`}
        {...containerAnimation}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full blur-lg"
          {...glowAnimation}
        />
        
        {/* Main container */}
        <div className="relative bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl border-2 border-blue-300/30">
          {/* Water drop with brain */}
          <div className="relative">
            <Droplets className={`${iconSizes[size]} text-white`} />
            {/* AI brain overlay */}
            <Brain className={`${subIconSizes[size]} text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
          </div>
        </div>
      </motion.div>
    );
  }

  // WaterAI - Futuristic AI assistant
  if (variant === 'waterai') {
    return (
      <motion.div 
        className={`${baseClass} relative`}
        {...containerAnimation}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-2xl blur-lg"
          {...glowAnimation}
        />
        
        {/* Main container */}
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-purple-300/30 overflow-hidden">
          {/* Circuit pattern background */}
          <div className="absolute inset-0 opacity-20">
            <Cpu className="w-full h-full text-white" />
          </div>
          
          {/* Main icon */}
          <div className="relative z-10">
            <Waves className={`${iconSizes[size]} text-white`} />
            <Zap className={`${subIconSizes[size]} text-yellow-300 absolute -top-1 -right-1`} />
          </div>
        </div>
      </motion.div>
    );
  }

  // DropBot (Default) - Drop-shaped robot (RECOMMENDED)
  return (
    <motion.div 
      className={`${baseClass} relative`}
      {...containerAnimation}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-3xl blur-lg"
        {...glowAnimation}
      />
      
      {/* Main container - drop shape */}
      <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/20 backdrop-blur-sm">
        {/* Layered effect */}
        <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
        
        {/* Icon group */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Droplets className={`${iconSizes[size]} text-white`} />
          {/* AI sparkles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className={`${subIconSizes[size]} text-yellow-300 animate-pulse`} />
          </div>
        </div>
        
        {/* Mini bot indicator */}
        <Bot className={`${subIconSizes[size]} text-white/80 absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4`} />
      </div>
    </motion.div>
  );
}

// Example usage component for preview
export function AvatarShowcase() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">AquaSmart Avatar Opcije</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* DropBot - RECOMMENDED */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200">
          <div className="flex items-center gap-6 mb-4">
            <AquaSmartAvatar variant="dropbot" size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">DropBot ⭐ PREPORUČENO</h2>
              <p className="text-gray-600">Kombinacija kapi vode i AI robota</p>
              <p className="text-sm text-teal-600 mt-1">Najmoderniji i prepoznatljiv</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AquaSmartAvatar variant="dropbot" size="sm" />
            <AquaSmartAvatar variant="dropbot" size="md" />
            <AquaSmartAvatar variant="dropbot" size="lg" />
            <AquaSmartAvatar variant="dropbot" size="xl" />
          </div>
        </div>

        {/* AquaBot */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-6 mb-4">
            <AquaSmartAvatar variant="aquabot" size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AquaBot</h2>
              <p className="text-gray-600">Robot sa vodenim elementima</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AquaSmartAvatar variant="aquabot" size="sm" />
            <AquaSmartAvatar variant="aquabot" size="md" />
            <AquaSmartAvatar variant="aquabot" size="lg" />
            <AquaSmartAvatar variant="aquabot" size="xl" />
          </div>
        </div>

        {/* SmartDrop */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-6 mb-4">
            <AquaSmartAvatar variant="smartdrop" size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">SmartDrop</h2>
              <p className="text-gray-600">Pametna kap vode sa AI mozgom</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AquaSmartAvatar variant="smartdrop" size="sm" />
            <AquaSmartAvatar variant="smartdrop" size="md" />
            <AquaSmartAvatar variant="smartdrop" size="lg" />
            <AquaSmartAvatar variant="smartdrop" size="xl" />
          </div>
        </div>

        {/* WaterAI */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-6 mb-4">
            <AquaSmartAvatar variant="waterai" size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">WaterAI</h2>
              <p className="text-gray-600">Futuristički AI asistent</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AquaSmartAvatar variant="waterai" size="sm" />
            <AquaSmartAvatar variant="waterai" size="md" />
            <AquaSmartAvatar variant="waterai" size="lg" />
            <AquaSmartAvatar variant="waterai" size="xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
