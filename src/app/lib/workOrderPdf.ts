type WorkOrderStatus = "active" | "pending" | "completed";

interface PrintableService {
  name: string;
  description?: string;
  cost?: number;
  completed?: boolean;
}

interface PrintableTask {
  name: string;
  cost?: number;
  completed: boolean;
}

interface PrintableProduct {
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
  totalCost?: number;
  discount?: number;
}

interface PrintableWaterAnalysis {
  pH?: number;
  chlorine?: number;
  alkalinity?: number;
  temperature?: number;
  redox?: number;
}

interface PrintableAutomation {
  systemType?: string;
  operationalStatus?: "ok" | "warning" | "error" | "off";
  lcdValues?: {
    ph?: string;
    redox?: string;
    chlorine?: string;
    salt?: string;
    temperature?: string;
  };
  canisters?: {
    phMinus?: "empty" | "low" | "ok" | "full";
    liquidChlorine?: "empty" | "low" | "ok" | "full";
    flocculant?: "empty" | "low" | "ok" | "full";
  };
  notes?: string;
}

interface PrintablePhoto {
  id?: string;
  category: "machine-room" | "equipment" | "pool" | "water" | "other" | "elements";
  path?: string;
  dataUrl?: string;
  note?: string;
}

export interface WorkOrderPrintData {
  order: {
    id: number | string;
    client?: string;
    location?: string;
    assignee?: string;
    status: WorkOrderStatus;
    dueDate?: string;
  };
  companyName?: string;
  services: PrintableService[];
  maintenanceTasks: PrintableTask[];
  productsUsed: PrintableProduct[];
  waterAnalysis?: PrintableWaterAnalysis;
  automationData?: PrintableAutomation;
  photos: PrintablePhoto[];
  hidePrices: boolean;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const hasValue = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== "";

const asFiniteNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value: unknown): string =>
  `${asFiniteNumber(value).toLocaleString("hr-HR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;

const formatNumber = (value: unknown): string =>
  asFiniteNumber(value).toLocaleString("hr-HR", {
    maximumFractionDigits: 2,
  });

const parseDate = (value?: string): Date => {
  const dateOnly = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : value
      ? new Date(value)
      : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
};

const safeTitlePart = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "bez-naziva";

const safeImageSource = (value: string): string => {
  const source = String(value || "").trim();
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(source) || /^blob:/i.test(source)) {
    return escapeHtml(source);
  }
  try {
    const url = new URL(source);
    if (url.protocol === "https:" && url.hostname.toLowerCase().endsWith(".supabase.co")) {
      return escapeHtml(url.toString());
    }
  } catch {
    // Invalid and non-approved image sources are omitted from the print document.
  }
  return "";
};

const section = (title: string, body: string): string =>
  body ? `<section><h2>${escapeHtml(title)}</h2>${body}</section>` : "";

const table = (headers: string[], rows: string[][], numericColumns: number[] = []): string => {
  if (!rows.length) return "";
  return `
    <table>
      <thead><tr>${headers.map((header, index) =>
        `<th${numericColumns.includes(index) ? ' class="number"' : ""}>${escapeHtml(header)}</th>`
      ).join("")}</tr></thead>
      <tbody>${rows.map((row) =>
        `<tr>${row.map((cell, index) =>
          `<td${numericColumns.includes(index) ? ' class="number"' : ""}>${cell}</td>`
        ).join("")}</tr>`
      ).join("")}</tbody>
    </table>`;
};

const waitForAssets = async (doc: Document): Promise<void> => {
  const images = Array.from(doc.images);
  const imagePromises = images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  });

  const fontsReady = "fonts" in doc
    ? (doc as Document & { fonts: FontFaceSet }).fonts.ready.catch(() => undefined)
    : Promise.resolve();

  await Promise.race([
    Promise.all([fontsReady, ...imagePromises]),
    new Promise<void>((resolve) => window.setTimeout(resolve, 6000)),
  ]);
};

export async function printWorkOrder(data: WorkOrderPrintData): Promise<void> {
  const {
    order,
    services,
    maintenanceTasks,
    productsUsed,
    waterAnalysis,
    automationData,
    photos,
    hidePrices,
  } = data;

  const documentDate = parseDate(order.dueDate);
  const generatedAt = new Date();
  const completedServices = services.filter((item) => item.completed);
  const completedTasks = maintenanceTasks.filter((item) => item.completed);

  const servicesTotal = completedServices.reduce((sum, item) => sum + asFiniteNumber(item.cost), 0);
  const tasksTotal = completedTasks.reduce((sum, item) => sum + asFiniteNumber(item.cost), 0);
  const productsTotal = productsUsed.reduce((sum, item) => sum + asFiniteNumber(item.totalCost), 0);
  const grandTotal = servicesTotal + tasksTotal + productsTotal;

  const statusLabels: Record<WorkOrderStatus, string> = {
    active: "AKTIVNO",
    pending: "NA ČEKANJU",
    completed: "ZAVRŠENO",
  };

  const serviceRows = completedServices.map((item) => {
    const row = [
      escapeHtml(item.name),
      escapeHtml(item.description || "—"),
    ];
    if (!hidePrices) row.push(escapeHtml(formatMoney(item.cost)));
    return row;
  });

  const taskRows = completedTasks.map((item) => {
    const row = [escapeHtml(item.name)];
    if (!hidePrices) row.push(escapeHtml(formatMoney(item.cost)));
    return row;
  });

  const productRows = productsUsed.map((item) => {
    const row = [
      escapeHtml(item.productName),
      escapeHtml(`${formatNumber(item.quantity)} ${item.unit || ""}`.trim()),
    ];
    if (!hidePrices) {
      row.push(
        escapeHtml(formatMoney(item.pricePerUnit)),
        escapeHtml(`${formatNumber(item.discount || 0)} %`),
        escapeHtml(formatMoney(item.totalCost)),
      );
    }
    return row;
  });

  const waterValues = [
    ["pH", waterAnalysis?.pH, ""],
    ["Klor", waterAnalysis?.chlorine, "ppm"],
    ["Alkalitet", waterAnalysis?.alkalinity, "ppm"],
    ["Temperatura", waterAnalysis?.temperature, "°C"],
    ["Redox", waterAnalysis?.redox, "mV"],
  ].filter(([, value]) => hasValue(value));

  const systemLabels: Record<string, string> = {
    klor: "Klor",
    so: "Sol",
    uv: "UV",
    ozon: "Ozon",
  };
  const operationalLabels: Record<string, string> = {
    ok: "OK",
    warning: "Upozorenje",
    error: "Greška",
    off: "Isključeno",
  };
  const canisterLabels: Record<string, string> = {
    empty: "prazno",
    low: "nisko",
    ok: "ok",
    full: "puno",
  };
  const lcdLabels: Record<string, string> = {
    ph: "pH",
    redox: "Redox",
    chlorine: "Klor",
    salt: "Sol",
    temperature: "Temperatura",
  };
  const canisterNames: Record<string, string> = {
    phMinus: "pH Minus",
    liquidChlorine: "Tekući klor",
    flocculant: "Flokulant",
  };

  const lcdValues = Object.entries(automationData?.lcdValues || {})
    .filter(([, value]) => hasValue(value))
    .map(([key, value]) => `${lcdLabels[key] || key}: ${String(value)}`);
  const canisterValues = Object.entries(automationData?.canisters || {})
    .filter(([, value]) => hasValue(value))
    .map(([key, value]) => `${canisterNames[key] || key}: ${canisterLabels[String(value)] || String(value)}`);
  const hasAutomation = Boolean(
    hasValue(automationData?.systemType)
    || hasValue(automationData?.operationalStatus)
    || lcdValues.length
    || canisterValues.length
    || hasValue(automationData?.notes),
  );

  const automationRows = hasAutomation
    ? [
        hasValue(automationData?.systemType)
          ? `<div><dt>Tip sustava</dt><dd>${escapeHtml(systemLabels[automationData?.systemType || ""] || automationData?.systemType)}</dd></div>`
          : "",
        hasValue(automationData?.operationalStatus)
          ? `<div><dt>Radni status</dt><dd>${escapeHtml(operationalLabels[automationData?.operationalStatus || ""] || automationData?.operationalStatus)}</dd></div>`
          : "",
        lcdValues.length
          ? `<div><dt>LCD vrijednosti</dt><dd>${lcdValues.map(escapeHtml).join(" · ")}</dd></div>`
          : "",
        canisterValues.length
          ? `<div><dt>Kanisteri</dt><dd>${canisterValues.map(escapeHtml).join(" · ")}</dd></div>`
          : "",
        hasValue(automationData?.notes)
          ? `<div class="wide"><dt>Napomene</dt><dd>${escapeHtml(automationData?.notes)}</dd></div>`
          : "",
      ].join("")
    : "";

  const photoLabels: Record<PrintablePhoto["category"], string> = {
    "machine-room": "Strojarnica",
    equipment: "Oprema",
    pool: "Bazen",
    water: "Voda",
    other: "Ostalo",
    elements: "Oprema",
  };
  const photosWithSources = photos
    .map((photo, index) => ({
      ...photo,
      printKey: photo.id || String(index),
      normalizedCategory: photo.category === "elements" ? "equipment" : photo.category,
      safeSource: safeImageSource(photo.dataUrl || ""),
    }))
    .filter((photo) => photo.safeSource);
  const printablePhotos: typeof photosWithSources = [];
  const preferredCategories = ["machine-room", "equipment", "pool", "water", "other"];
  preferredCategories.forEach((category) => {
    const first = photosWithSources.find(photo =>
      photo.normalizedCategory === category
      && !printablePhotos.some(selected => selected.printKey === photo.printKey)
    );
    if (first) printablePhotos.push(first);
  });
  photosWithSources.forEach((photo) => {
    if (
      printablePhotos.length < 6
      && !printablePhotos.some(selected => selected.printKey === photo.printKey)
    ) {
      printablePhotos.push(photo);
    }
  });

  const title = `Radni-nalog-${safeTitlePart(order.id)}-${safeTitlePart(order.client)}-${formatDate(documentDate)}`;
  const html = `<!doctype html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    html, body { background: #fff; color: #000; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16mm;
      padding-bottom: 5mm;
      border-bottom: 1.2mm solid #0B2A3C;
    }
    .company { font-size: 20pt; font-weight: 750; color: #0B2A3C; letter-spacing: -.02em; }
    .document-meta { text-align: right; }
    .document-meta strong { display: block; font-size: 14pt; white-space: nowrap; }
    .document-meta span { color: #333; }
    .summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3mm 8mm;
      margin: 7mm 0;
      padding: 5mm;
      background: #f4f7f8;
      border-left: 1mm solid #0B2A3C;
    }
    .summary div, .detail-grid div { break-inside: avoid; }
    dt {
      margin: 0 0 1mm;
      color: #59636a;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    dd { margin: 0; font-weight: 650; white-space: pre-wrap; overflow-wrap: anywhere; }
    section { margin-top: 7mm; break-inside: auto; }
    h2 {
      margin: 0 0 3mm;
      padding-bottom: 1.5mm;
      color: #0B2A3C;
      border-bottom: .35mm solid #b8c5ca;
      font-size: 12pt;
      letter-spacing: .01em;
    }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th {
      padding: 2.2mm;
      color: #fff;
      background: #0B2A3C;
      font-size: 7.5pt;
      letter-spacing: .04em;
      text-align: left;
      text-transform: uppercase;
    }
    td { padding: 2.4mm 2.2mm; border-bottom: .25mm solid #d8dee1; vertical-align: top; }
    .number { text-align: right; white-space: nowrap; }
    .totals {
      width: 78mm;
      margin: 5mm 0 0 auto;
      border-top: .5mm solid #0B2A3C;
    }
    .totals div { display: flex; justify-content: space-between; gap: 8mm; padding: 1.3mm 0; }
    .totals .grand {
      margin-top: 1mm;
      padding-top: 2mm;
      border-top: .3mm solid #7c898f;
      color: #0B2A3C;
      font-size: 12pt;
      font-weight: 800;
    }
    .water-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      border: .3mm solid #cbd4d8;
    }
    .water-grid div { padding: 3mm; border-right: .3mm solid #cbd4d8; text-align: center; break-inside: avoid; }
    .water-grid div:last-child { border-right: 0; }
    .water-grid span { display: block; color: #59636a; font-size: 7.5pt; text-transform: uppercase; }
    .water-grid strong { display: block; margin-top: 1mm; color: #0B2A3C; font-size: 12pt; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; }
    .detail-grid .wide { grid-column: 1 / -1; }
    .photo-grid { display: grid; grid-template-columns: repeat(3, 55mm); gap: 4mm; align-items: start; }
    figure { width: 55mm; margin: 0; break-inside: avoid; }
    figure img { display: block; width: 55mm; height: 42mm; object-fit: cover; border: .25mm solid #cbd4d8; }
    figcaption { padding-top: 1.2mm; color: #0B2A3C; font-size: 8pt; font-weight: 700; }
    footer {
      margin-top: 10mm;
      padding-top: 3mm;
      border-top: .35mm solid #0B2A3C;
      color: #59636a;
      font-size: 8pt;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <div class="company">${escapeHtml(data.companyName || "AquaSmart Pro")}</div>
    <div class="document-meta">
      <strong>RADNI NALOG br. ${escapeHtml(order.id)}</strong>
      <span>${escapeHtml(formatDate(documentDate))}</span>
    </div>
  </header>

  <dl class="summary">
    <div><dt>Klijent</dt><dd>${escapeHtml(order.client || "—")}</dd></div>
    <div><dt>Lokacija</dt><dd>${escapeHtml(order.location || "—")}</dd></div>
    <div><dt>Izvršitelj</dt><dd>${escapeHtml(order.assignee || "—")}</dd></div>
    <div><dt>Status</dt><dd>${escapeHtml(statusLabels[order.status] || order.status)}</dd></div>
  </dl>

  ${section("Izvršene usluge", table(
    hidePrices ? ["Naziv", "Opis"] : ["Naziv", "Opis", "Iznos"],
    serviceRows,
    hidePrices ? [] : [2],
  ))}

  ${section("Zadaci održavanja", table(
    hidePrices ? ["Naziv"] : ["Naziv", "Iznos"],
    taskRows,
    hidePrices ? [] : [1],
  ))}

  ${section("Utrošena kemija", table(
    hidePrices
      ? ["Proizvod", "Količina"]
      : ["Proizvod", "Količina", "Cijena/jed.", "Popust", "Ukupno"],
    productRows,
    hidePrices ? [] : [2, 3, 4],
  ))}

  ${!hidePrices && (completedServices.length || completedTasks.length || productsUsed.length) ? `
    <div class="totals">
      <div><span>Usluge</span><strong>${escapeHtml(formatMoney(servicesTotal))}</strong></div>
      <div><span>Zadaci</span><strong>${escapeHtml(formatMoney(tasksTotal))}</strong></div>
      <div><span>Kemija</span><strong>${escapeHtml(formatMoney(productsTotal))}</strong></div>
      <div class="grand"><span>UKUPNO</span><strong>${escapeHtml(formatMoney(grandTotal))}</strong></div>
    </div>` : ""}

  ${section("Analiza vode", waterValues.length ? `
    <div class="water-grid">${waterValues.map(([label, value, unit]) => `
      <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(`${formatNumber(value)} ${unit}`.trim())}</strong></div>
    `).join("")}</div>` : "")}

  ${section("Automatika", automationRows ? `<dl class="detail-grid">${automationRows}</dl>` : "")}

  ${section("Fotografije", printablePhotos.length ? `
    <div class="photo-grid">${printablePhotos.map((photo) => `
      <figure>
        <img src="${photo.safeSource}" alt="${escapeHtml(photoLabels[photo.category])}">
        <figcaption>${escapeHtml(photoLabels[photo.category])}</figcaption>
      </figure>
    `).join("")}</div>` : "")}

  <footer>Dokument generiran u AquaSmart Pro · ${escapeHtml(generatedAt.toLocaleString("hr-HR"))}</footer>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument;
  if (!frameWindow || !frameDocument) {
    iframe.remove();
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  await waitForAssets(frameDocument);
  await new Promise<void>((resolve) =>
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  );

  let removed = false;
  let fallbackTimer = 0;
  const cleanup = () => {
    if (removed) return;
    removed = true;
    window.clearTimeout(fallbackTimer);
    window.removeEventListener("afterprint", cleanup);
    frameWindow.removeEventListener("afterprint", cleanup);
    iframe.remove();
  };

  frameWindow.addEventListener("afterprint", cleanup, { once: true });
  window.addEventListener("afterprint", cleanup, { once: true });
  fallbackTimer = window.setTimeout(cleanup, 120000);

  frameWindow.focus();
  frameWindow.print();
}
