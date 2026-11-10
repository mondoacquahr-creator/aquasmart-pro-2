import React from 'react';
import { Cylinder, Package, ShoppingBag, Box } from 'lucide-react';

interface PackagingIconProps {
  sizeString: string;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
}

export const PackagingIcon: React.FC<PackagingIconProps> = ({ 
  sizeString, 
  className = "", 
  iconSize = 20,
  showLabel = false
}) => {
  const s = String(sizeString || "").toLowerCase();
  
  // High-visibility color classes with glow effects for dark environments
  const largeStyle = "text-orange-400 bg-orange-500/20 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]";
  const mediumStyle = "text-yellow-300 bg-yellow-500/20 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
  const smallStyle = "text-amber-200 bg-amber-500/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
  const defaultStyle = "text-slate-400 bg-slate-500/10 border-slate-500/30";

  let icon = <Box size={iconSize} />;
  let style = defaultStyle;
  let title = "Standardno pakiranje";
  let label = "STD";

  if (s.includes('20 kg') || s.includes('20kg') || s.includes('25 kg') || s.includes('25kg') || s.includes('20 l') || s.includes('20l')) {
    icon = <Cylinder size={iconSize} />;
    style = largeStyle;
    title = "Veliko pakiranje (20kg+)";
    label = "25kg";
  } else if (s.includes('5 kg') || s.includes('5kg') || s.includes('5 l') || s.includes('5l') || s.includes('10 kg') || s.includes('10kg')) {
    icon = <Package size={iconSize} />;
    style = mediumStyle;
    title = "Srednje pakiranje (5-10kg)";
    label = "5kg";
  } else if (s.includes('1 kg') || s.includes('1kg') || s.includes('1 l') || s.includes('1l')) {
    icon = <ShoppingBag size={iconSize} />;
    style = smallStyle;
    title = "Malo pakiranje (1kg)";
    label = "1kg";
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${style} ${className}`}
      title={title}
    >
      {icon}
      {showLabel && (
        <span className="text-[8px] font-black mt-0.5 uppercase opacity-90 leading-none">
          {label}
        </span>
      )}
    </div>
  );
};
