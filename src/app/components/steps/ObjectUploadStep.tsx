import { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Upload, Plus, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getThemeColors } from '../../utils/theme';

interface ObjectUploadStepProps {
  onAddObject: (imageUrl: string, name: string) => void;
  onBack: () => void;
}

export function ObjectUploadStep({ onAddObject, onBack }: ObjectUploadStepProps) {
  const [objectImage, setObjectImage] = useState<string | null>(null);
  const [objectName, setObjectName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showSavedObjects, setShowSavedObjects] = useState(false);
  const [savedObjects, setSavedObjects] = useState<Array<{ id: number; name: string; imageUrl: string; timestamp: string }>>([]);

  // Always use exterior theme
  const theme = getThemeColors('exterior');

  const loadSavedObjects = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('mondoAcquaSavedObjects') || '[]');
      setSavedObjects(saved);
      setShowSavedObjects(true);
      if (saved.length === 0) {
        toast.info('Nemate spremljenih objekata. Prvo spremite objekt nakon crop-a!');
      }
    } catch (error) {
      console.error('Error loading saved objects:', error);
      toast.error('Greška pri učitavanju spremljenih objekata');
    }
  };

  const handleLoadSavedObject = (obj: { id: number; name: string; imageUrl: string }) => {
    setObjectImage(obj.imageUrl);
    setObjectName(obj.name);
    setShowSavedObjects(false);
    toast.success(`Objekt "${obj.name}" učitan!`);
  };

  const handleDeleteSavedObject = (id: number) => {
    try {
      const saved = JSON.parse(localStorage.getItem('mondoAcquaSavedObjects') || '[]');
      const filtered = saved.filter((obj: any) => obj.id !== id);
      localStorage.setItem('mondoAcquaSavedObjects', JSON.stringify(filtered));
      setSavedObjects(filtered);
      toast.success('Objekt izbrisan');
    } catch (error) {
      console.error('Error deleting object:', error);
      toast.error('Greška pri brisanju objekta');
    }
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setObjectImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (objectImage && objectName) {
      onAddObject(objectImage, objectName);
      // Reset form
      setObjectImage(null);
      setObjectName('');
    }
  };

  return (
    <div className={`min-h-screen ${theme.bgGradient} flex items-center justify-center p-6 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/3 left-1/3 w-96 h-96 ${theme.bgOrb1} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-1/3 right-1/3 w-96 h-96 ${theme.bgOrb2} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1.5s' }} />
      </div>

      <GlassCard className="w-full max-w-4xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${theme.iconGradient} rounded-2xl flex items-center justify-center shadow-lg ${theme.iconShadow}`}>
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
              Učitaj objekt
            </h1>
            <p className="text-white/60 text-sm md:text-base">Dodajte fotografiju bazena, jacuzzija ili drugog objekta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Object Name */}
          <div>
            <Label htmlFor="objectName" className="text-white/90 mb-2 block">
              Naziv objekta
            </Label>
            <Input
              id="objectName"
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="npr. Bazen, Jacuzzi, Sauna..."
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-white/90 mb-3 block">Fotografija objekta</Label>
            {!objectImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-105'
                    : 'border-white/20 hover:border-indigo-500/50 hover:bg-white/5'
                }`}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Upload className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-lg text-white mb-2">Povucite i ispustite fotografiju ovdje</h3>
                <p className="text-white/50 mb-4">ili</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="object-upload"
                  required
                />
                <label htmlFor="object-upload">
                  <Button
                    type="button"
                    asChild
                    className={`bg-gradient-to-r ${theme.buttonGradient} shadow-lg ${theme.buttonShadow.split(' ')[0]}`}
                  >
                    <span className="cursor-pointer">Pregledaj datoteke</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img
                    src={objectImage}
                    alt="Object preview"
                    className="w-full h-auto max-h-[400px] object-contain bg-black/20"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="object-change"
                />
                <label htmlFor="object-change">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                    asChild
                  >
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Promijeni fotografiju
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-sm text-white/70">
              💡 <span className="font-semibold">Savjet:</span> Ako slika sadrži druge elemente osim objekta (npr. pozadina, drugi objekti), u sljedećem koraku moći ćete precizno izrezati samo željeni objekt.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Natrag
            </Button>
            <Button
              type="submit"
              size="lg"
              className={`min-w-40 bg-gradient-to-r ${theme.buttonGradient} text-white shadow-lg transition-all duration-300 hover:scale-105 ${theme.buttonShadow}`}
              disabled={!objectImage || !objectName}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nastavi na izrezivanje
            </Button>
          </div>
        </form>

        {/* Saved Objects */}
        {showSavedObjects && (
          <div className="mt-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-4">Spremljeni objekti</h2>
            {savedObjects.length === 0 ? (
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
                <p className="text-white/60">Nemate spremljenih objekata</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedObjects.map(obj => (
                  <div key={obj.id} className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl mb-3"
                      style={{
                        background: `
                          repeating-conic-gradient(#808080 0% 25%, #404040 0% 50%) 
                          50% / 20px 20px
                        `,
                      }}
                    >
                      <img
                        src={obj.imageUrl}
                        alt={obj.name}
                        className="w-full h-auto max-h-[150px] object-contain"
                      />
                    </div>
                    <p className="text-sm font-semibold text-white mb-3">{obj.name}</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                        onClick={() => handleLoadSavedObject(obj)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Učitaj
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                        onClick={() => handleDeleteSavedObject(obj.id)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Izbriši
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 mt-4"
              onClick={() => setShowSavedObjects(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zatvori
            </Button>
          </div>
        )}

        {/* Load Saved Objects Button */}
        {!showSavedObjects && (
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={loadSavedObjects}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Učitaj spremljene objekte
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
