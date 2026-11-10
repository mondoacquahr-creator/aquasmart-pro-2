import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

export const ExportAppButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();
      
      // Koristimo Vite import.meta.glob za dohvaćanje sadržaja svih .ts, .tsx, .css i .json datoteka kao string
      // Napomena: ovo radi na razini builda u Vite-u
      const files = import.meta.glob('/src/**/*.{ts,tsx,css,json,html,md}', { 
        query: '?raw', 
        import: 'default' 
      });

      let fileCount = 0;

      // Iteriraj po fajlovima i dodaj u ZIP
      for (const path in files) {
        const loadFileContent = files[path] as () => Promise<string>;
        const content = await loadFileContent();
        // Spremi s relativnom putanjom unutar root-a
        zip.file(path.replace(/^\//, ''), content);
        fileCount++;
      }

      // Generiraj zip
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Use native browser download instead of file-saver
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mondo-acqua-source-code.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Uspješno izvezeno ${fileCount} datoteka koda!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Došlo je do pogreške pri izvozu koda.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="bg-black/50 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] gap-2 whitespace-nowrap"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isExporting ? 'Izvozim...' : 'Preuzmi Kod (Export ZIP)'}
    </Button>
  );
};