import { jsPDF } from 'jspdf';
import { Pool, WaterAnalysis, Client, ProductRecommendation } from '../types';

// Helper function to handle Croatian characters in PDF
function fixCroatianChars(text: string): string {
  return text
    .replace(/č/g, 'c')
    .replace(/Č/g, 'C')
    .replace(/ć/g, 'c')
    .replace(/Ć/g, 'C')
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'Dj')
    .replace(/š/g, 's')
    .replace(/Š/g, 'S')
    .replace(/ž/g, 'z')
    .replace(/Ž/g, 'Z');
}

interface PDFExportData {
  pool: Pool;
  analysis: WaterAnalysis;
  client?: Client;
}

export function generateAnalysisPDF(data: PDFExportData): void {
  const { pool, analysis, client } = data;
  const doc = new jsPDF();
  
  // Mondo Acqua branding color
  const mondoTeal = [20, 184, 166]; // #14b8a6
  const darkGray = [55, 65, 81];
  const lightGray = [156, 163, 175];
  
  let yPos = 20;
  
  // Header - Logo & Title
  doc.setFillColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AquaSmart Pro', 15, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Analiza bazenske vode', 15, 23);
  doc.text(new Date(analysis.date).toLocaleDateString('hr-HR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), 15, 28);
  
  yPos = 45;
  
  // Client & Pool Info
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informacije o bazenu', 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (client) {
    doc.setFont('helvetica', 'bold');
    doc.text('Klijent:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(client.name, 45, yPos);
    yPos += 6;
    
    if (client.phone) {
      doc.setFont('helvetica', 'bold');
      doc.text('Telefon:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(client.phone, 45, yPos);
      yPos += 6;
    }
    
    if (client.email) {
      doc.setFont('helvetica', 'bold');
      doc.text('Email:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(client.email, 45, yPos);
      yPos += 6;
    }
    
    yPos += 3;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Naziv:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(String(pool.name), 45, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Volumen:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${pool.volume} m³`, 45, yPos);
  yPos += 6;
  
  if (pool.location?.address) {
    doc.setFont('helvetica', 'bold');
    doc.text('Lokacija:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const address = pool.location.address;
    if (address.length > 80) {
      const lines = doc.splitTextToSize(address, 150);
      doc.text(lines, 45, yPos);
      yPos += 6 * lines.length;
    } else {
      doc.text(address, 45, yPos);
      yPos += 6;
    }
  }
  
  if (pool.disinfectionSystem) {
    doc.setFont('helvetica', 'bold');
    doc.text('Dezinfekcija:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const disinfectionText = 
      pool.disinfectionSystem === 'elektroliza' ? 'Elektroliza (solna)' :
      pool.disinfectionSystem === 'klor-ph' ? 'Klor + pH (automatsko doziranje)' :
      pool.disinfectionSystem === 'peroksid' ? 'Peroksid' :
      pool.disinfectionSystem === 'tablete' ? 'Tablete' : '-';
    doc.text(disinfectionText, 45, yPos);
    yPos += 6;
  }
  
  yPos += 5;
  
  // Status Badge
  const getStatusInfo = () => {
    switch (analysis.status) {
      case 'ok':
        return { text: 'VODA U REDU', color: [34, 197, 94] }; // green
      case 'warning':
        return { text: 'POTREBNE KOREKCIJE', color: [234, 179, 8] }; // yellow
      case 'critical':
        return { text: 'KRITICNO STANJE', color: [239, 68, 68] }; // red
      default:
        return { text: 'NEPOZNATO', color: [156, 163, 175] }; // gray
    }
  };
  
  const statusInfo = getStatusInfo();
  doc.setFillColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
  doc.roundedRect(15, yPos, 70, 10, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(statusInfo.text, 50, yPos + 7, { align: 'center' });
  
  yPos += 18;
  
  // Water Parameters
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Parametri vode', 15, yPos);
  yPos += 8;
  
  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, 180, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Parametar', 20, yPos + 2);
  doc.text('Izmjerena vrijednost', 85, yPos + 2);
  doc.text('CILJ (Optimalno)', 145, yPos + 2);
  yPos += 12;
  
  const parameters = [
    { name: 'pH', value: analysis.parameters.pH, unit: '', optimal: '7.2 - 7.6' },
    { name: 'Slobodni klor', value: analysis.parameters.freeChlorine, unit: 'mg/l', optimal: '0.5 - 1.5 mg/l' },
    { name: 'Alkalnost', value: analysis.parameters.alkalinity, unit: 'mg/l', optimal: '80 - 120 mg/l' },
    { name: 'Tvrdoca', value: analysis.parameters.hardness, unit: 'mg/l', optimal: '200 - 400 mg/l' },
  ];
  
  if (analysis.parameters.temperature) {
    parameters.push({ 
      name: 'Temperatura', 
      value: analysis.parameters.temperature, 
      unit: '°C', 
      optimal: '-' 
    });
  }
  
  if (analysis.parameters.orp) {
    parameters.push({ 
      name: 'ORP', 
      value: analysis.parameters.orp, 
      unit: 'mV', 
      optimal: '650 - 750 mV' 
    });
  }
  
  parameters.forEach((param, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos - 5, 180, 10, 'F');
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(param.name, 20, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${param.value} ${param.unit}`, 85, yPos + 2);
    
    // TARGET / OPTIMAL part - LARGER AND BOLDER
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
    doc.text(param.optimal, 145, yPos + 2);
    
    yPos += 10;
  });
  
  yPos += 5;
  
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ivero preporuke za tretman', 15, yPos);
    yPos += 8;
    
    analysis.recommendations.forEach((rec: ProductRecommendation, index: number) => {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      // Recommendation box
      doc.setFillColor(236, 253, 245); // Light teal
      doc.roundedRect(15, yPos - 5, 180, 20, 2, 2, 'F');
      doc.setDrawColor(20, 184, 166);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, yPos - 5, 180, 20, 2, 2, 'S');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`${index + 1}. ${rec.productName}`, 20, yPos + 2);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(rec.category || '', 20, yPos + 8);
      
      // Dosage badge
      doc.setFillColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
      doc.roundedRect(140, yPos - 2, 50, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${rec.quantity} ${rec.unit}`, 165, yPos + 4, { align: 'center' });
      
      yPos += 25;
    });
    
    yPos += 5;
  }
  
  // Notes section
  if (analysis.notes) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    if (analysis.notes.equipmentIssues) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Eventualni kvarovi', 15, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const issuesLines = doc.splitTextToSize(analysis.notes.equipmentIssues, 175);
      doc.text(issuesLines, 15, yPos);
      yPos += 5 * issuesLines.length + 5;
    }
    
    if (analysis.notes.additionalWork) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ostali izvrseni radovi', 15, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const workLines = doc.splitTextToSize(analysis.notes.additionalWork, 175);
      doc.text(workLines, 15, yPos);
      yPos += 5 * workLines.length + 5;
    }
    
    if (analysis.notes.productsLeft && analysis.notes.productsLeft.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ostavljeni proizvodi na objektu', 15, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      analysis.notes.productsLeft.forEach(product => {
        doc.text(`• ${product.name} - ${product.quantity}`, 20, yPos);
        yPos += 5;
      });
      yPos += 3;
    }
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 275, 210, 22, 'F');
    doc.setDrawColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
    doc.setLineWidth(1);
    doc.line(15, 276, 195, 276);
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Mondo Acqua d.o.o.', 15, 283);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Strucnjaci za bazene i wellness sustave', 15, 288);
    doc.text(`Stranica ${i} od ${pageCount}`, 195, 288, { align: 'right' });
  }
  
  const fileName = `analiza_${pool.name.replace(/\s+/g, '_')}_${new Date(analysis.date).toLocaleDateString('hr-HR').replace(/\./g, '-')}.pdf`;
  doc.save(fileName);
}

export function generateWorkOrderPDF(workOrder: any, pool: Pool, client?: Client): void {
  const doc = new jsPDF();
  
  // Parse work order data from notes
  let workOrderData: any = null;
  if (workOrder.notes) {
    try {
      workOrderData = JSON.parse(workOrder.notes);
    } catch (e) {
      workOrderData = { 
        description: workOrder.notes, 
        services: {}, 
        servicesLabels: {}, 
        replacements: [], 
        analysisEnabled: false,
        usedChemicals: [],
        billingItems: []
      };
    }
  } else {
    workOrderData = { 
      description: workOrder.additionalNotes || '', 
      services: {}, 
      servicesLabels: {}, 
      replacements: [], 
      analysisEnabled: false,
      usedChemicals: [],
      billingItems: []
    };
  }

  const orangeColor = [255, 87, 34]; // Strong orange from image
  const lightOrange = [255, 230, 220]; // For table rows/backgrounds
  const grayColor = [100, 100, 100];
  const blackColor = [0, 0, 0];
  
  let yPos = 10;
  const margin = 10;
  const width = 190;
  
  // --- HEADER SECTION ---
  // TVRTKA and NARUCITELJ Headers
  doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(margin, yPos, width/2 + 25, 8, 'F');
  doc.rect(margin + width/2 + 25, yPos, width/2 - 25, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TVRTKA', margin + (width/2 + 25)/2, yPos + 5.5, { align: 'center' });
  doc.text('NARUCITELJ', margin + width/2 + 25 + (width/2 - 25)/2, yPos + 5.5, { align: 'center' });
  
  yPos += 8;
  
  // TVRTKA and NARUCITELJ Content Boxes
  doc.setDrawColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, width/2 + 25, 25);
  doc.rect(margin + width/2 + 25, yPos, width/2 - 25, 25);
  
  doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Mondo Acqua d.o.o.', margin + 3, yPos + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Ulica, Grad, OIB', margin + 3, yPos + 11);
  doc.text('www.mondoacqua.hr', margin + 3, yPos + 16);
  doc.text('info@mondoacqua.hr', margin + 3, yPos + 21);
  
  // Narucitelj info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(fixCroatianChars(client?.name || pool.name), margin + width/2 + 28, yPos + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  if (client?.address || pool.location?.address) {
    const addr = client?.address || pool.location?.address || '';
    const addrLines = doc.splitTextToSize(fixCroatianChars(addr), width/2 - 35);
    doc.text(addrLines, margin + width/2 + 28, yPos + 11);
  }
  
  yPos += 25;
  
  // Narudzbenica broj
  doc.rect(margin, yPos, width, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Narudzbenica broj: ${workOrderData.orderNumber || ''}`, margin + 3, yPos + 5.5);
  
  yPos += 8;
  yPos += 5; // spacing
  
  // U _____ god.
  doc.setDrawColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(margin, yPos, width, 8);
  doc.text(`U ____________________________________________________________________________________ god.`, margin + 3, yPos + 5.5);
  if (workOrderData.year) {
     doc.text(workOrderData.year, margin + 8, yPos + 5.5);
  }
  
  yPos += 8;
  yPos += 5; // spacing
  
  // Rad zapocet / Rad zavrsen
  doc.rect(margin, yPos, width/2, 8);
  doc.rect(margin + width/2, yPos, width/2, 8);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '_________________';
    return new Date(dateStr).toLocaleDateString('hr-HR') + ' ' + new Date(dateStr).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  };
  
  doc.text(`Rad zapocet: ${formatDate(workOrderData.dateStarted)}`, margin + 3, yPos + 5.5);
  doc.text(`Rad zavrsen: ${formatDate(workOrder.completedAt || workOrderData.dateCompleted)}`, margin + width/2 + 3, yPos + 5.5);
  
  yPos += 8;
  yPos += 5; // spacing
  
  // RADNI NALOG br.
  doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(margin, yPos, 103, 12, 'F');
  doc.setDrawColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(margin, yPos, width, 12);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RADNI NALOG', margin + 51.5, yPos + 8.5, { align: 'center' });
  
  doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
  doc.setFontSize(14);
  doc.text(`br. ${workOrder.workOrderNumber || workOrder.id}`, margin + 110, yPos + 8.5);
  
  yPos += 12;
  yPos += 5; // spacing
  
  // Mjesto troska
  doc.rect(margin, yPos, width, 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mjesto troska: ${fixCroatianChars(workOrderData.costCenter || pool.name)}`, margin + 3, yPos + 5.5);
  
  yPos += 8;
  yPos += 5; // spacing
  
  // Nositelj troska
  doc.rect(margin, yPos, width, 8);
  doc.text(`Nositelj troska: ${fixCroatianChars(workOrderData.costBearer || client?.name || '')}`, margin + 3, yPos + 5.5);
  
  yPos += 8;
  yPos += 5; // spacing
  
  // Opis rada (Big Box)
  doc.rect(margin, yPos, width, 120);
  doc.text('Opis rada:', margin + 3, yPos + 6);
  
  let contentY = yPos + 12;
  doc.setFontSize(8);
  
  // Split description if long
  const desc = workOrderData.description || '';
  const descLines = doc.splitTextToSize(fixCroatianChars(desc), width - 10);
  doc.text(descLines, margin + 5, contentY);
  contentY += descLines.length * 4 + 5;
  
  // Add Services if any
  if (workOrderData.services) {
    const completedServices = Object.entries(workOrderData.services)
      .filter(([_, completed]) => completed)
      .map(([id, _]) => workOrderData.servicesLabels?.[id] || `Usluga ${id}`);
    
    if (completedServices.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('IZVRSENE USLUGE:', margin + 5, contentY);
      doc.setFont('helvetica', 'normal');
      contentY += 4;
      completedServices.forEach(s => {
        doc.text(`- ${fixCroatianChars(s)}`, margin + 8, contentY);
        contentY += 4;
      });
      contentY += 2;
    }
  }
  
  // Add Chemicals if any
  if (workOrderData.usedChemicals && workOrderData.usedChemicals.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('UTROSENE KEMIKALIJE:', margin + 5, contentY);
    doc.setFont('helvetica', 'normal');
    contentY += 4;
    workOrderData.usedChemicals.forEach((c: any) => {
      doc.text(`- ${fixCroatianChars(c.name)}: ${c.quantity} ${c.unit}`, margin + 8, contentY);
      contentY += 4;
    });
    contentY += 2;
  }
  
  // Add Billing if any
  if (workOrder.billing?.items && workOrder.billing.items.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('OBRACUN TROSKOVA:', margin + 5, contentY);
    doc.setFont('helvetica', 'normal');
    contentY += 4;
    workOrder.billing.items.forEach((item: any) => {
      const sum = (item.quantity || 0) * (item.price || 0);
      const discount = item.discount || 0;
      const finalSum = sum * (1 - discount/100);
      
      doc.text(`- ${fixCroatianChars(item.description)}: ${finalSum.toFixed(2)} EUR`, margin + 8, contentY);
      contentY += 4;
    });
    doc.setFont('helvetica', 'bold');
    doc.text(`UKUPNO: ${workOrder.billing.total.toFixed(2)} EUR`, margin + 185, contentY, { align: 'right' });
    contentY += 4;
  }
  
  // "Ispostavio" at the bottom right of the box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Ispostavio:', margin + width - 60, yPos + 110);
  doc.text('_________________________', margin + width - 60, yPos + 116);
  if (workOrder.completedByName) {
     doc.text(fixCroatianChars(workOrder.completedByName), margin + width - 58, yPos + 115);
  }
  
  yPos += 120;
  yPos += 15;
  
  // --- FOOTER ---
  doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.rect(margin, yPos + 5, width, 1, 'F');
  
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFontSize(8);
  doc.text('AquaSmart Pro | Modern & Simple Work Order and Maintenance Management CMMS', margin, yPos + 15);
  doc.text('www.mondoacqua.hr', margin + width, yPos + 15, { align: 'right' });

  // --- ANALYSIS SECTION ---
  const mondoTeal = [20, 184, 166];
  const darkGray = [55, 65, 81];

  const renderAnalysisHeader = (title: string, subtitle: string) => {
    doc.addPage();
    doc.setFillColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(fixCroatianChars(title), 15, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(fixCroatianChars(subtitle), 15, 23);
    return 45; // Start Y
  };

  if (workOrder.analysisResults) {
    let analysisY = renderAnalysisHeader('Analiza Vode', 'Rezultati i preporuke iz radnog naloga');
    const analysis = workOrder.analysisResults;
    
    // Status Badge
    const getStatusInfo = () => {
        switch (analysis.status) {
          case 'ok': return { text: 'VODA U REDU', color: [34, 197, 94] };
          case 'warning': return { text: 'POTREBNE KOREKCIJE', color: [234, 179, 8] };
          case 'critical': return { text: 'KRITICNO STANJE', color: [239, 68, 68] };
          default: return { text: 'NEPOZNATO', color: [156, 163, 175] };
        }
    };
    const statusInfo = getStatusInfo();
    doc.setFillColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
    doc.roundedRect(15, analysisY, 70, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(statusInfo.text, 50, analysisY + 7, { align: 'center' });
    
    analysisY += 20;
    
    // Parameters Table
    if (analysis.parameters) {
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(14);
        doc.text('Parametri vode', 15, analysisY);
        analysisY += 8;
        
        doc.setFillColor(240, 240, 240);
        doc.rect(15, analysisY - 5, 180, 10, 'F');
        doc.setFontSize(11);
        doc.text('Parametar', 20, analysisY + 2);
        doc.text('Vrijednost', 100, analysisY + 2);
        analysisY += 12;
        
        const params = [
            { name: 'pH', value: analysis.parameters.pH, unit: '' },
            { name: 'Slobodni klor', value: analysis.parameters.chlorine || analysis.parameters.freeChlorine, unit: 'mg/l' },
            { name: 'Alkalnost', value: analysis.parameters.alkalinity, unit: 'mg/l' },
            { name: 'Temperatura', value: analysis.parameters.temperature, unit: '°C' },
            { name: 'ORP', value: analysis.parameters.redox || analysis.parameters.orp, unit: 'mV' }
        ].filter(p => p.value !== undefined && p.value !== null);
        
        params.forEach((p, idx) => {
            if (idx % 2 === 1) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, analysisY - 5, 180, 10, 'F');
            }
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(p.name, 20, analysisY + 2);
            doc.setFont('helvetica', 'normal');
            doc.text(`${p.value} ${p.unit}`, 100, analysisY + 2);
            analysisY += 10;
        });
        analysisY += 10;
    }
    
    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Preporuke za tretman', 15, analysisY);
        analysisY += 10;
        
        analysis.recommendations.forEach((rec: any, idx: number) => {
             if (analysisY > 260) {
                 doc.addPage();
                 analysisY = 20;
             }

            // Recommendation box
            doc.setDrawColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
            doc.setLineWidth(0.5);
            doc.roundedRect(15, analysisY - 5, 180, 20, 2, 2, 'S');
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            doc.text(`${idx + 1}. ${fixCroatianChars(rec.productName)}`, 20, analysisY + 2);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            // Instructions
             const instructionsLines = doc.splitTextToSize(fixCroatianChars(rec.instructions || ''), 120);
             doc.text(instructionsLines, 20, analysisY + 8);
            
            // Dosage
            doc.setFillColor(mondoTeal[0], mondoTeal[1], mondoTeal[2]);
            doc.roundedRect(150, analysisY - 2, 40, 8, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`${rec.quantity} ${rec.unit}`, 170, analysisY + 4, { align: 'center' });
            
            analysisY += 25;
        });
    }
  } else if (workOrderData.analysisEnabled && workOrderData.analysisParams) {
    // Fallback for manual analysis parameters
    let analysisY = renderAnalysisHeader('Analiza Vode', 'Rucno uneseni parametri');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Parametri vode', 15, analysisY);
    analysisY += 8;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(15, analysisY - 5, 180, 10, 'F');
    doc.setFontSize(11);
    doc.text('Parametar', 20, analysisY + 2);
    doc.text('Vrijednost', 100, analysisY + 2);
    analysisY += 12;

    const params = [
        { name: 'pH', value: workOrderData.analysisParams.ph, unit: '' },
        { name: 'Slobodni klor', value: workOrderData.analysisParams.chlorine, unit: 'mg/l' },
        { name: 'Alkalnost', value: workOrderData.analysisParams.alkalinity, unit: 'mg/l' },
        { name: 'Temperatura', value: workOrderData.analysisParams.temperature, unit: '°C' },
        { name: 'ORP', value: workOrderData.analysisParams.redox, unit: 'mV' }
    ].filter(p => p.value !== undefined && p.value !== '' && p.value !== null);

    params.forEach((p, idx) => {
        if (idx % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, analysisY - 5, 180, 10, 'F');
        }
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(p.name, 20, analysisY + 2);
        doc.setFont('helvetica', 'normal');
        doc.text(`${p.value} ${p.unit}`, 100, analysisY + 2);
        analysisY += 10;
    });
  }

  // --- PHOTOS SECTION ---
  const photos = [...(workOrder.photos || []), ...(workOrder.machineRoomPhotos || [])].filter(p => p && p.dataUrl);
  
  if (photos.length > 0) {
    let photoY = renderAnalysisHeader('Fotodokumentacija', 'Fotografije s terena');
    
    const colWidth = 85;
    const rowHeight = 65; 
    const gap = 10;
    
    for (let i = 0; i < photos.length; i += 2) {
        if (photoY + rowHeight > 270) {
            doc.addPage();
            photoY = 20;
        }
        
        // Photo 1 (Left)
        const p1 = photos[i];
        if (p1 && p1.dataUrl) {
            try {
                doc.addImage(p1.dataUrl, 'JPEG', 15, photoY, colWidth, rowHeight);
                doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
                doc.setFontSize(8);
                const category = p1.category === 'machine-room' ? 'Strojarnica' : p1.category === 'elements' ? 'Elementi' : 'Bazen';
                doc.text(category, 15, photoY + rowHeight + 5);
                const dateStr = p1.timestamp ? new Date(p1.timestamp).toLocaleString('hr-HR') : '';
                doc.text(dateStr, 15 + colWidth, photoY + rowHeight + 5, { align: 'right' });
            } catch (e) { console.error(e); }
        }
        
        // Photo 2 (Right)
        if (i + 1 < photos.length) {
            const p2 = photos[i+1];
            if (p2 && p2.dataUrl) {
                try {
                    doc.addImage(p2.dataUrl, 'JPEG', 15 + colWidth + gap, photoY, colWidth, rowHeight);
                    const category = p2.category === 'machine-room' ? 'Strojarnica' : p2.category === 'elements' ? 'Elementi' : 'Bazen';
                     doc.text(category, 15 + colWidth + gap, photoY + rowHeight + 5);
                     const dateStr = p2.timestamp ? new Date(p2.timestamp).toLocaleString('hr-HR') : '';
                     doc.text(dateStr, 15 + colWidth + gap + colWidth, photoY + rowHeight + 5, { align: 'right' });
                } catch (e) { console.error(e); }
            }
        }
        
        photoY += rowHeight + 15;
    }
  }

  // Generate filename
  const fileName = `radni_nalog_${workOrder.workOrderNumber || workOrder.id}.pdf`;
  doc.save(fileName);
}
