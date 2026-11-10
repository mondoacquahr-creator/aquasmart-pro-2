import React, { useState, useEffect } from 'react';
import { Upload, Camera, Trash2, Loader2, Image as ImageIcon, Plus, X, Maximize2 } from 'lucide-react';
import { api } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ImageUploaderProps {
  onImageUploaded: (url: string, path: string) => void;
  onImageRemoved: (path: string) => void;
  existingImages?: Array<{ url: string; path: string }>;
  maxImages?: number;
  folder?: string;
}

export function ImageUploader({ 
  onImageUploaded, 
  onImageRemoved, 
  existingImages = [], 
  maxImages = 5,
  folder = 'general'
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; path: string }>>(existingImages);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setPreviewImages(existingImages);
  }, [existingImages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (previewImages.length + files.length > maxImages) {
      toast.error(`Možete učitati najviše ${maxImages} slika.`);
      return;
    }

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const path = `uploads/${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const result = await api.uploadImage(file, path);
        
        if (result.success) {
          const newImage = { url: result.url, path: result.path };
          setPreviewImages(prev => [...prev, newImage]);
          onImageUploaded(result.url, result.path);
        }
      }
      toast.success('Slike su uspješno učitane.');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Greška pri učitavanju slike. Jeste li povezani na internet?');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (path: string) => {
    setPreviewImages(prev => prev.filter(img => img.path !== path));
    onImageRemoved(path);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previewImages.map((img, idx) => (
          <div key={img.path} className="relative aspect-square group rounded-xl overflow-hidden border border-amber-500/20 bg-slate-900/50">
            <ImageWithFallback 
              src={img.url} 
              alt={`Upload ${idx}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => setSelectedImage(img.url)}
                className="p-2 bg-amber-600/80 text-white rounded-full hover:bg-amber-500 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeImage(img.path)}
                className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {previewImages.length < maxImages && (
          <label className={`relative aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isUploading 
              ? 'border-amber-500/20 bg-slate-900/20 pointer-events-none' 
              : 'border-amber-500/30 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50'
          }`}>
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-[10px] text-amber-500 font-medium uppercase tracking-widest">Učitavanje...</span>
              </>
            ) : (
              <>
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Dodaj sliku</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
              className="hidden" 
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Full Screen Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <ImageWithFallback src={selectedImage} alt="Full preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
