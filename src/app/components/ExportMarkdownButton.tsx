import { Button } from './ui/button';
import { Download } from 'lucide-react';

export const ExportMarkdownButton = () => {
  return (
    <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
      <Download className="w-4 h-4 mr-2" />
      Export MD (Uskoro)
    </Button>
  );
};
