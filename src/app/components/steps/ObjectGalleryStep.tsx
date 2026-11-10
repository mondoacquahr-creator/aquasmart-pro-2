import { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Upload, Check, Sparkles } from 'lucide-react';
import { getThemeColors } from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';

// Import MONDO ACQUA bazena
import pool1 from 'figma:asset/8deee15fa0b5e4da0ae5e689b006b5c261eea242.png';
import pool2 from 'figma:asset/260911ecd705f047ca76c0af247a70c5e722d858.png';
import pool3 from 'figma:asset/e8674225e477df3dff987df3006e0c66df42dd7d.png';
import pool4 from 'figma:asset/ca576051994add64d06615636a346b9c4a11b998.png';
import pool5 from 'figma:asset/1c61a64302cbdbc3ca3f5599c04cb593d86323ae.png';
import pool7 from 'figma:asset/d86aab69185c67d75f3717168e3b6ec471ec9485.png';
import pool8 from 'figma:asset/7975189cec73cc7dd975e4545ca67d2ed101d78c.png';

interface GalleryObject {
  id: string;
  name: string;
  imageUrl: string;
  category: 'bazen';
  thumbnail: string;
  dimensions?: { width: number; height: number };
}

interface ObjectGalleryStepProps {
  selectedObjectType: 'bazen';
  onSelectFromGallery: (object: GalleryObject) => void;
  onUploadCustom: () => void;
  onBack: () => void;
}

// MONDO ACQUA Bazeni - Originalne slike
const GALLERY_OBJECTS: GalleryObject[] = [
  {
    id: 'pool-mondo-acqua-1',
    name: 'Klasični Pravokutni Bazen',
    imageUrl: pool1,
    thumbnail: pool1,
    category: 'bazen',
  },
  {
    id: 'pool-mondo-acqua-2',
    name: 'Moderni Bazen s Drvenom Terasom',
    imageUrl: pool2,
    thumbnail: pool2,
    category: 'bazen',
  },
  {
    id: 'pool-mondo-acqua-3',
    name: 'Elegantni Bazen s Pokrivačem',
    imageUrl: pool3,
    thumbnail: pool3,
    category: 'bazen',
  },
  {
    id: 'pool-mondo-acqua-4',
    name: 'Bijeli Rub Premium Bazen',
    imageUrl: pool4,
    thumbnail: pool4,
    category: 'bazen',
  },
  {
    id: 'pool-mondo-acqua-5',
    name: 'Bazen s Pokrivačem Nadsvod',
    imageUrl: pool5,
    thumbnail: pool5,
    category: 'bazen',
  },
  {
    id: 'pool-mondo-acqua-7',
    name: 'Moderni Sivi Rub Bazen',
    imageUrl: pool7,
    thumbnail: pool7,
    category: 'bazen',
  },
  {
    id: 'pool-mondo-acqua-8',
    name: 'Vrtni Bazen s Drvenom Terasom',
    imageUrl: pool8,
    thumbnail: pool8,
    category: 'bazen',
  },
];

export function ObjectGalleryStep({ 
  selectedObjectType, 
  onSelectFromGallery, 
  onUploadCustom,
  onBack 
}: ObjectGalleryStepProps) {
  const [selectedObject, setSelectedObject] = useState<GalleryObject | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const theme = getThemeColors('exterior');
  const { t } = useLanguage();

  // Get translated object names
  const getObjectName = (id: string): string => {
    const nameMap: Record<string, string> = {
      'pool-mondo-acqua-1': t.galleryObjects.poolMondoAcqua1,
      'pool-mondo-acqua-2': t.galleryObjects.poolMondoAcqua2,
      'pool-mondo-acqua-3': t.galleryObjects.poolMondoAcqua3,
      'pool-mondo-acqua-4': t.galleryObjects.poolMondoAcqua4,
      'pool-mondo-acqua-5': t.galleryObjects.poolMondoAcqua5,
      'pool-mondo-acqua-7': t.galleryObjects.poolMondoAcqua7,
      'pool-mondo-acqua-8': t.galleryObjects.poolMondoAcqua8,
    };
    return nameMap[id] || id;
  };

  // Filter objects by selected type
  const filteredObjects = GALLERY_OBJECTS.filter(obj => obj.category === selectedObjectType);

  const handleSelectObject = (object: GalleryObject) => {
    setSelectedObject(object);
  };

  const handleConfirmSelection = () => {
    if (selectedObject) {
      console.log('🎯 ObjectGalleryStep: Confirming selection:', selectedObject);
      onSelectFromGallery(selectedObject);
    } else {
      console.warn('⚠️ ObjectGalleryStep: No object selected!');
    }
  };

  const getCategoryTitle = () => {
    switch (selectedObjectType) {
      case 'bazen': return t.objectGallery.poolTitle;
      default: return t.objectGallery.galleryTitle;
    }
  };

  const getCategoryDescription = () => {
    switch (selectedObjectType) {
      case 'bazen': return t.objectGallery.poolDescription;
      default: return t.objectGallery.galleryTitle;
    }
  };

  return (
    <div className={`min-h-screen ${theme.bgGradient} flex items-center justify-center p-6 relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${theme.bgOrb1} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }} />
        <div className={`absolute bottom-1/4 left-1/4 w-96 h-96 ${theme.bgOrb2} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      <GlassCard className="w-full max-w-7xl p-8 md:p-12 relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${theme.iconGradient} rounded-2xl flex items-center justify-center shadow-lg ${theme.iconShadow}`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
              {getCategoryTitle()}
            </h1>
            <p className="text-white/60 text-sm md:text-base">{getCategoryDescription()}</p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white/90 mb-4">{t.objectGallery.galleryTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredObjects.map((object) => {
              const isSelected = selectedObject?.id === object.id;
              const isHovered = hoveredId === object.id;

              return (
                <button
                  key={object.id}
                  onClick={() => handleSelectObject(object)}
                  onMouseEnter={() => setHoveredId(object.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    group relative rounded-2xl overflow-hidden
                    transition-all duration-300 hover-spring gpu-accelerated
                    ${isSelected 
                      ? `ring-4 ${theme.ringColor} scale-105 shadow-2xl ${theme.iconShadow} neon-border` 
                      : 'hover:scale-110 hover:shadow-xl'
                    }
                  `}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] relative bg-black/20">
                    <img
                      src={object.thumbnail}
                      alt={getObjectName(object.id)}
                      className={`
                        w-full h-full object-cover
                        transition-transform duration-500
                        ${isHovered ? 'scale-110' : 'scale-100'}
                      `}
                    />
                    
                    {/* Overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                      transition-opacity duration-300
                      ${isSelected || isHovered ? 'opacity-100' : 'opacity-60'}
                    `} />

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className={`
                        absolute top-3 right-3
                        w-10 h-10 rounded-full
                        bg-gradient-to-br ${theme.iconGradient}
                        flex items-center justify-center
                        shadow-lg ${theme.iconShadow}
                        animate-pulse
                      `}>
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {/* Name */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm md:text-base">
                        {getObjectName(object.id)}
                      </h3>
                    </div>

                    {/* Hover Border Effect */}
                    {isHovered && !isSelected && (
                      <div className={`
                        absolute inset-0 border-2 ${theme.borderColor}
                        rounded-2xl pointer-events-none
                      `} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Upload Option */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/50">{t.objectGallery.or}</span>
            </div>
          </div>

          <button
            onClick={onUploadCustom}
            className={`
              mt-6 w-full p-6 rounded-2xl
              border-2 border-dashed border-white/20
              bg-white/5 backdrop-blur-sm
              hover:bg-white/10 hover:border-white/40
              transition-all duration-300
              group
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`
                w-16 h-16 rounded-2xl
                bg-gradient-to-br ${theme.iconGradient}
                flex items-center justify-center
                shadow-lg ${theme.iconShadow}
                transition-transform duration-300
                group-hover:scale-110
              `}>
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  {t.objectGallery.uploadCustomTitle}
                </h3>
                <p className="text-white/60 text-sm">
                  {t.objectGallery.uploadCustomDescription}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.objectGallery.back}
          </Button>

          {selectedObject && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white/60 text-sm">{t.objectGallery.selected}</p>
                <p className="text-white font-semibold">{getObjectName(selectedObject.id)}</p>
              </div>
              <Button
                onClick={handleConfirmSelection}
                size="lg"
                className={`
                  min-w-40 bg-gradient-to-r ${theme.buttonGradient}
                  text-white shadow-lg transition-all duration-300
                  hover:scale-105 ${theme.buttonShadow}
                `}
              >
                {t.objectGallery.confirm}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
