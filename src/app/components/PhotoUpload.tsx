import { Upload } from 'lucide-react';
import { Button } from './ui/button';

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string) => void;
  hasImage: boolean;
}

export function PhotoUpload({ onImageUpload, hasImage }: PhotoUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="photo-upload"
      />
      <label htmlFor="photo-upload">
        <Button asChild variant={hasImage ? "outline" : "default"}>
          <span className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {hasImage ? 'Change Photo' : 'Upload Photo'}
          </span>
        </Button>
      </label>
    </div>
  );
}
