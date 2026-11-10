import { QRCodeSVG } from 'qrcode.react';
import { WarehouseItem } from '../lib/warehouseStorage';
import { ArrowLeft, Printer, X } from 'lucide-react';

interface QRLabelPrinterProps {
  items: WarehouseItem[];
  onClose: () => void;
}

export function QRLabelPrinter({ items, onClose }: QRLabelPrinterProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900 z-[60] overflow-y-auto flex flex-col print:bg-white">
      {/* Header - Hidden during print */}
      <div className="bg-zinc-800 border-b border-amber-500/20 p-4 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-700 rounded-xl transition-colors text-amber-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">Generiranje QR Naljepnica</h1>
          </div>
          <button
            onClick={handlePrint}
            className="bg-amber-500 text-zinc-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg"
          >
            <Printer className="w-5 h-5" />
            Isprintaj Naljepnice
          </button>
        </div>
      </div>

      {/* Label Grid */}
      <div className="flex-1 p-8 print:p-0 bg-zinc-900 print:bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm print:shadow-none print:border-zinc-300 print:rounded-none print:w-[60mm] print:h-[40mm] print:overflow-hidden"
              style={{ pageBreakInside: 'avoid' }}
            >
              <div className="mb-2">
                <QRCodeSVG 
                  value={item.id} 
                  size={100} 
                  level="H"
                  includeMargin={true}
                  className="print:w-[25mm] print:h-[25mm]"
                />
              </div>
              <div className="w-full">
                <h3 className="text-zinc-900 font-black text-sm uppercase leading-tight line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-1">
                  ID: {item.id.split('_').pop()}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <span className="text-[10px] bg-amber-500 text-zinc-900 px-1.5 rounded font-black">
                    AquaSmart Pro
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Instructions */}
      <div className="p-8 text-center text-gray-400 print:hidden">
        <p className="text-sm">
          * Za najbolje rezultate koristite A4 naljepnice (npr. 3x8 ili 4x10).<br />
          Postavite "Margins" na "None" u postavkama ispisa.
        </p>
      </div>
    </div>
  );
}
