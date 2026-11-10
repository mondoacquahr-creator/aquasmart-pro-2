import { useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden border border-amber-500/30 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 text-center">
          <Camera className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">Skeniraj barkod / QR kod</h2>
          <p className="text-gray-400 text-sm mb-6">
            Kamera trenutno nije dostupna. <br/>
            Unesite kod ručno:
          </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              placeholder="Unesi kod..."
            />
            <button
              onClick={() => {
                if (inputValue) {
                  onScan(inputValue);
                }
              }}
              className="bg-amber-500 text-black font-bold px-4 py-3 rounded-xl hover:bg-amber-600 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}