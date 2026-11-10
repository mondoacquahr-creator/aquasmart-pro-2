import { useState, useRef } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Printer, Download, Send, CheckCircle2, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner@2.0.3';
import { getThemeColors } from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';

interface ResultsStepProps {
  compositeImageUrl: string;
  originalPhotoUrl: string;
  onStartNew: () => void;
}

export function ResultsStep({ compositeImageUrl, originalPhotoUrl, onStartNew }: ResultsStepProps) {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'Želim zatražiti ponudu za ugradnju bazena/jacuzzija prikazanog na slici.'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Always use exterior theme
  const theme = getThemeColors('exterior');
  const { t } = useLanguage();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MONDO ACQUA - Vizualizacija projekta</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>MONDO ACQUA D.O.O.</h1>
          <h2>Vizualizacija vašeg projekta</h2>
          <img src="${compositeImageUrl}" alt="Projekt vizualizacija" />
          <div class="footer">
            <p><strong>MONDO ACQUA D.O.O.</strong></p>
            <p>www.mondo-acqua.hr</p>
            <p>Stručnjaci za bazene, jacuzzije i saune</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generiranje PDF-a...');
      
      // Use the compositeImageUrl directly - no need for html2canvas!
      // The image was already captured in DesignCanvasStep
      
      // Load the image to get dimensions
      const img = new Image();
      img.src = compositeImageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Calculate PDF dimensions (A4 format)
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (img.height * imgWidth) / img.width;

      // Add header
      pdf.setFontSize(20);
      pdf.text('MONDO ACQUA D.O.O.', pdfWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text('Vizualizacija projekta', pdfWidth / 2, 25, { align: 'center' });

      // Add image
      const yPosition = imgHeight + 40 > pdfHeight ? 30 : 35;
      const finalHeight = imgHeight + 40 > pdfHeight ? pdfHeight - 70 : imgHeight;
      const finalWidth = (img.width * finalHeight) / img.height;
      
      pdf.addImage(compositeImageUrl, 'PNG', (pdfWidth - finalWidth) / 2, yPosition, finalWidth, finalHeight);

      // Add footer
      const footerY = pdfHeight - 15;
      pdf.setFontSize(10);
      pdf.text('www.mondo-acqua.hr | Stručnjaci za bazene, jacuzzije i saune', pdfWidth / 2, footerY, { align: 'center' });

      // Save PDF
      pdf.save(`mondo-acqua-projekt-${Date.now()}.pdf`);
      
      toast.dismiss();
      toast.success('PDF uspješno preuzet!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Greška pri generiranju PDF-a');
    }
  };

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate sending offer request
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Zahtjev za ponudu uspješno poslan! MONDO ACQUA će vas uskoro kontaktirati.');
      setShowOfferForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'Želim zatražiti ponudu za ugradnju bazena/jacuzzija prikazanog na slici.'
      });
    } catch (error) {
      toast.error('Greška pri slanju zahtjeva. Pokušajte ponovno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen w-full ${theme.bgGradient} p-6 flex items-center justify-center relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${theme.bgOrb1} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-1/4 left-1/4 w-96 h-96 ${theme.bgOrb2} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-6xl space-y-6 relative z-10">
        <GlassCard className="p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent mb-2`}>
              {t.results.title}
            </h1>
            <p className="text-white/70 text-lg">
              {t.results.subtitle}
            </p>
          </div>

          {/* Before/After Images */}
          <div className="space-y-6 mb-8" ref={imageRef}>
            {/* Original Photo - PRIJE */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.iconGradient} flex items-center justify-center shadow-lg ${theme.iconShadow}`}>
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
                  {t.results.before}
                </h2>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={originalPhotoUrl} 
                  alt="Originalna fotografija" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Final Photo - POSLIJE */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.iconGradient} flex items-center justify-center shadow-lg ${theme.iconShadow} animate-pulse`}>
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
                  {t.results.after}
                </h2>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-sky-400/50">
                <img 
                  src={compositeImageUrl} 
                  alt="Finalna vizualizacija" 
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                  <p className="text-white text-sm font-semibold">MONDO ACQUA D.O.O.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!showOfferForm ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button
                onClick={handlePrint}
                className="h-16 text-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Printer className="w-5 h-5 mr-2" />
                Isprintaj
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                className="h-16 text-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Download className="w-5 h-5 mr-2" />
                Preuzmi PDF
              </Button>
              
              <Button
                onClick={() => setShowOfferForm(true)}
                className="h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Send className="w-5 h-5 mr-2" />
                Zatraži ponudu
              </Button>
            </div>
          ) : (
            /* Offer Request Form */
            <form onSubmit={handleSendOffer} className="space-y-4 mb-6">
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Pošalji zahtjev za ponudu - MONDO ACQUA D.O.O.
                </h3>
                <p className="text-white/70 text-sm mb-6">
                  Popunite svoje podatke i kontaktirat ćemo vas s detaljnom ponudom
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Ime i prezime *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Vaše ime i prezime"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="vas.email@primjer.hr"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Telefon *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="+385 xx xxx xxxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">Poruka</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowOfferForm(false)}
                    variant="outline"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Odustani
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? 'Slanje...' : 'Pošalji zahtjev'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center pt-6 border-t border-white/10">
            <Button
              onClick={onStartNew}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Započni novi projekt
            </Button>
            
            <div className="mt-6 text-white/50 text-sm">
              <p className="font-semibold">MONDO ACQUA D.O.O.</p>
              <a 
                href="https://www.mondo-acqua.hr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white/70 transition-colors"
              >
                www.mondo-acqua.hr
              </a>
              <p className="mt-1">Stručnjaci za bazene, jacuzzije i saune</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
