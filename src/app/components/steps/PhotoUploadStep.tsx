import { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Upload, ArrowRight, Image as ImageIcon, Camera } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';

interface PhotoUploadStepProps {
  initialPhoto: string | null;
  onNext: (photo: string) => void;
}

export function PhotoUploadStep({ initialPhoto, onNext }: PhotoUploadStepProps) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Always use exterior theme - SIMPLIFIED for performance
  const bgGradient = 'bg-slate-950';
  const iconGradient = 'from-amber-400 to-yellow-500';
  const textGradient = 'from-amber-200 to-yellow-400';
  const buttonGradient = 'from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500';
  const uploadText = 'text-amber-300';
  const borderHover = 'hover:border-amber-500/50';
  const borderActive = 'border-amber-500 bg-amber-500/10';

  return (
    <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-6 relative overflow-hidden`}>
      {/* Animated gold orb background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Language selector in top right */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      <GlassCard className="w-full max-w-4xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${textGradient} bg-clip-text text-transparent`}>
              {t.photoUpload.title}
            </h1>
            <p className="text-white/60 text-sm md:text-base">{t.photoUpload.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          {!photo ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                isDragging
                  ? borderActive + ' scale-105'
                  : `border-white/20 ${borderHover} hover:bg-white/5`
              }`}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
                <Upload className={`w-12 h-12 ${uploadText}`} />
              </div>
              <h3 className="text-xl text-white mb-2">{t.photoUpload.dropzone}</h3>
              <p className="text-white/50 mb-6">{t.common.or || 'ili'}</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
                id="camera-capture"
              />
              <div className="flex gap-3 justify-center flex-wrap">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className={`inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r ${buttonGradient} text-white font-medium transition-all duration-300 hover:shadow-lg`}>
                    <Upload className="w-4 h-4 mr-2" />
                    {t.photoUpload.uploadButton}
                  </span>
                </label>
                <label htmlFor="camera-capture" className="cursor-pointer">
                  <span className={`inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r ${buttonGradient} text-white font-medium transition-all duration-300 hover:shadow-lg`}>
                    <Camera className="w-4 h-4 mr-2" />
                    {t.photoUpload.camera}
                  </span>
                </label>
              </div>
              <p className="text-sm text-white/40 mt-6">
                {t.photoUpload.formats}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <img
                  src={photo}
                  alt="Room preview"
                  className="w-full h-auto max-h-[500px] object-contain bg-black/20"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="file-change"
                />
                <label htmlFor="file-change" className="flex-1 cursor-pointer">
                  <span className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.photoUpload.changePhoto}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-10">
          <Button 
            onClick={() => photo && onNext(photo)} 
            disabled={!photo} 
            size="lg"
            className={`min-w-40 bg-gradient-to-r ${buttonGradient} text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t.photoUpload.next}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
