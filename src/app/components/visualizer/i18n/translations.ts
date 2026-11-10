export type Language = 'hr' | 'en' | 'de' | 'it';

export interface Translations {
  // Home Step
  home: {
    title: string;
    subtitle: string;
    jacuzzi: {
      title: string;
      description: string;
    };
    pool: {
      title: string;
      description: string;
    };
    other: {
      title: string;
      description: string;
    };
    select: string;
    selectQuestion: string;
    workflow: string;
    workflowSteps: string;
    poweredBy: string;
  };
  
  // Steps Navigation
  steps: {
    uploadSpace: string;
    editSpace: string;
    uploadObject: string;
    cropObject: string;
    placeObject: string;
  };
  
  // Photo Upload Step
  photoUpload: {
    title: string;
    description: string;
    uploadButton: string;
    dropzone: string;
    formats: string;
    camera: string;
    saved: string;
    changePhoto: string;
    next: string;
    back: string;
  };
  
  // Photo Edit Step
  photoEdit: {
    title: string;
    description: string;
    cropSpace: string;
    cropDescription: string;
    eraseObjects: string;
    eraseDescription: string;
    brushSize: string;
    reset: string;
    apply: string;
    next: string;
    back: string;
  };
  
  // Object Gallery Step
  objectGallery: {
    jacuzziTitle: string;
    poolTitle: string;
    otherTitle: string;
    jacuzziDescription: string;
    poolDescription: string;
    otherDescription: string;
    galleryTitle: string;
    uploadCustomTitle: string;
    uploadCustomDescription: string;
    selected: string;
    confirm: string;
    or: string;
    back: string;
  };
  
  // Gallery Objects
  galleryObjects: {
    jacuzziRound: string;
    jacuzziSquare: string;
    jacuzziOutdoor: string;
    jacuzziModern: string;
    poolMondoAcqua1: string;
    poolMondoAcqua2: string;
    poolMondoAcqua3: string;
    poolMondoAcqua4: string;
    poolMondoAcqua5: string;
    poolMondoAcqua7: string;
    poolMondoAcqua8: string;
    poolRectangular: string;
    poolInfinity: string;
    poolRound: string;
    poolModern: string;
    poolLuxury: string;
    poolCompact: string;
    poolNatural: string;
    poolLap: string;
    sauna: string;
    fountain: string;
    pond: string;
    pergola: string;
  };
  
  // Object Upload Step
  objectUpload: {
    title: string;
    description: string;
    uploadButton: string;
    dropzone: string;
    formats: string;
    camera: string;
    saved: string;
    next: string;
    back: string;
  };
  
  // Object Crop Step
  objectCrop: {
    title: string;
    description: string;
    dragCorners: string;
    precision: string;
    reset: string;
    apply: string;
    next: string;
    back: string;
  };
  
  // Design Canvas Step
  designCanvas: {
    title: string;
    description: string;
    addAnother: string;
    finish: string;
    back: string;
    delete: string;
    objects: string;
  };
  
  // Results Step
  results: {
    title: string;
    subtitle: string;
    before: string;
    after: string;
    print: string;
    downloadPdf: string;
    sendOffer: string;
    startNew: string;
    projectDetails: string;
    type: string;
    objects: string;
    exterior: string;
    interior: string;
  };
  
  // AI Assistant
  aiAssistant: {
    title: string;
    placeholder: string;
    tips: {
      photoUpload: string;
      photoEdit: string;
      objectGallery: string;
      objectUpload: string;
      objectCrop: string;
      designCanvas: string;
    };
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    or: string;
  };
}

export const translations: Record<Language, Translations> = {
  hr: {
    home: {
      title: 'Uređenje Eksterijera',
      subtitle: 'Vizualizirajte svoj savršeni vanjski prostor s profesionalnim alatima za dizajn',
      jacuzzi: {
        title: 'Jacuzzi',
        description: 'Postavite luksuzni jacuzzi u vaš vanjski prostor',
      },
      pool: {
        title: 'Bazen',
        description: 'Vizualizirajte bazen savršenih dimenzija',
      },
      other: {
        title: 'Ostalo',
        description: 'Dodajte bilo koji drugi objekt po želji',
      },
      select: 'Odaberi',
      selectQuestion: 'Koji objekt želite postaviti?',
      workflow: 'Jednostavan proces u 5 koraka:',
      workflowSteps: 'Odaberite tip → Učitajte fotografiju → Uredite prostor → Učitajte objekt → Postavite objekt',
      poweredBy: 'Powered by',
    },
    steps: {
      uploadSpace: 'Učitaj prostor',
      editSpace: 'Uredi prostor',
      uploadObject: 'Učitaj objekt',
      cropObject: 'Izreži objekt',
      placeObject: 'Postavi objekt',
    },
    photoUpload: {
      title: 'Učitajte fotografiju vanjskog prostora',
      description: 'Dodajte fotografiju dvorišta, vrta ili terase gdje želite postaviti objekt',
      uploadButton: 'Učitaj Fotografiju',
      dropzone: 'Kliknite ili povucite fotografiju ovdje',
      formats: 'PNG, JPG ili WEBP (maks. 10MB)',
      camera: 'Slikaj',
      saved: 'Učitaj spremljene objekte',
      changePhoto: 'Promijeni Fotografiju',
      next: 'Nastavi',
      back: 'Natrag',
    },
    photoEdit: {
      title: 'Uredite svoj prostor',
      description: 'Označite područje gdje želite postaviti objekt',
      cropSpace: 'Označi prostor',
      cropDescription: 'Povucite točke da označite područje za objekt',
      eraseObjects: 'Obriši objekte',
      eraseDescription: 'Uklonite neželjene objekte iz fotografije',
      brushSize: 'Veličina kista',
      reset: 'Resetiraj',
      apply: 'Primijeni',
      next: 'Nastavi',
      back: 'Natrag',
    },
    objectGallery: {
      jacuzziTitle: 'Jacuzzi Modeli',
      poolTitle: 'Bazen Modeli',
      otherTitle: 'Ostali Objekti',
      jacuzziDescription: 'Odaberite savren jacuzzi za vaš prostor ili uploadajte vlastiti',
      poolDescription: 'Odaberite idealan bazen za vaše dvorište ili uploadajte vlastiti',
      otherDescription: 'Odaberite objekt ili uploadajte vlastiti',
      galleryTitle: 'Galerija Objekata',
      uploadCustomTitle: 'Uploadajte Vlastiti Objekt',
      uploadCustomDescription: 'Imate vlastitu fotografiju? Dodajte je ovdje',
      selected: 'Odabrano:',
      confirm: 'Potvrdi Odabir',
      or: 'ili',
      back: 'Natrag',
    },
    galleryObjects: {
      jacuzziRound: 'Okrugli Jacuzzi - Luksuzni',
      jacuzziSquare: 'Kvadratni Jacuzzi - Premium',
      jacuzziOutdoor: 'Vanjski Jacuzzi - Spa',
      jacuzziModern: 'Moderni Jacuzzi - Minimalistički',
      poolMondoAcqua1: 'Klasični Pravokutni Bazen',
      poolMondoAcqua2: 'Moderni Bazen s Drvenom Terasom',
      poolMondoAcqua3: 'Elegantni Bazen s Pokrivačem',
      poolMondoAcqua4: 'Bijeli Rub Premium Bazen',
      poolMondoAcqua5: 'Bazen s Pokrivačem Nadsvod - Family',
      poolMondoAcqua7: 'Moderni Sivi Rub Bazen - Elegantni',
      poolMondoAcqua8: 'Vrtni Bazen s Drvenom Terasom - Premium',
      poolRectangular: 'Pravokutni Bazen - Klasični',
      poolInfinity: 'Infinity Bazen - Premium',
      poolRound: 'Okrugli Bazen - Kompaktni',
      poolModern: 'Moderni Bazen - Dizajnerski',
      poolLuxury: 'Luksuzni Bazen - Resort Stil',
      poolCompact: 'Kompaktni Bazen - Minimalistički',
      poolNatural: 'Prirodni Bazen - Organski',
      poolLap: 'Lap Bazen - Sportski',
      sauna: 'Sauna - Outdoor',
      fountain: 'Fontana - Dekorativna',
      pond: 'Vrtni Ribnjak',
      pergola: 'Pergola s Bazenom',
    },
    objectUpload: {
      title: 'Učitajte fotografiju objekta',
      description: 'Dodajte fotografiju bazena, jacuzzi-ja ili drugog objekta',
      uploadButton: 'Učitaj Objekt',
      dropzone: 'Kliknite ili povucite fotografiju ovdje',
      formats: 'PNG, JPG ili WEBP (maks. 10MB)',
      camera: 'Slikaj',
      saved: 'Spremi objekt',
      next: 'Nastavi',
      back: 'Natrag',
    },
    objectCrop: {
      title: 'Izolirajte objekt',
      description: 'Povucite točke da precizno izrežete objekt',
      dragCorners: 'Povucite kutove da izolirate objekt',
      precision: 'Povećajte preciznost za bolje rezultate',
      reset: 'Resetiraj',
      apply: 'Primijeni',
      next: 'Nastavi',
      back: 'Natrag',
    },
    designCanvas: {
      title: 'Dizajn i Transformacija',
      description: 'Vaš objekt je automatski postavljen na označeni prostor',
      addAnother: 'Dodaj Drugi Objekt',
      finish: 'Završi Projekt',
      back: 'Natrag',
      delete: 'Obriši',
      objects: 'Objekti',
    },
    results: {
      title: 'Vaš Projekt je Gotov!',
      subtitle: 'Preuzmite rezultat ili zatražite ponudu',
      before: 'Prije',
      after: 'Nakon',
      print: 'Ispiši',
      downloadPdf: 'Preuzmi PDF',
      sendOffer: 'Pošalji Upit za Ponudu',
      startNew: 'Počni Novi Projekt',
      projectDetails: 'Detalji Projekta',
      type: 'Tip',
      objects: 'Objekti',
      exterior: 'Eksterijer',
      interior: 'Interijer',
    },
    aiAssistant: {
      title: 'AI Asistent',
      placeholder: 'Postavite pitanje...',
      tips: {
        photoUpload: 'Učitajte jasnu fotografiju vanjskog prostora s dobrim osvjetljenjem.',
        photoEdit: 'Precizno označite područje gdje želite postaviti objekt.',
        objectGallery: 'Odaberite objekt iz galerije ili uploadajte vlastiti.',
        objectUpload: 'Uploadajte fotografiju objekta s transparentnom pozadinom za najbolje rezultate.',
        objectCrop: 'Povucite kutove da precizno izolujete objekt.',
        designCanvas: 'Vaš objekt je automatski transformiran i postavljen. Možete dodati više objekata.',
      },
    },
    common: {
      loading: 'Učitavanje...',
      error: 'Greška',
      success: 'Uspješno',
      cancel: 'Odustani',
      save: 'Spremi',
      delete: 'Obriši',
      edit: 'Uredi',
      close: 'Zatvori',
      or: 'ili',
    },
  },
  
  en: {
    home: {
      title: 'Exterior Design',
      subtitle: 'Visualize your perfect outdoor space with professional design tools',
      jacuzzi: {
        title: 'Jacuzzi',
        description: 'Place a luxury jacuzzi in your outdoor space',
      },
      pool: {
        title: 'Pool',
        description: 'Visualize a pool with perfect dimensions',
      },
      other: {
        title: 'Other',
        description: 'Add any other object of your choice',
      },
      select: 'Select',
      selectQuestion: 'Which object would you like to place?',
      workflow: 'Simple 5-step process:',
      workflowSteps: 'Select type → Upload photo → Edit space → Upload object → Place object',
      poweredBy: 'Powered by',
    },
    steps: {
      uploadSpace: 'Upload Space',
      editSpace: 'Edit Space',
      uploadObject: 'Upload Object',
      cropObject: 'Crop Object',
      placeObject: 'Place Object',
    },
    photoUpload: {
      title: 'Upload Outdoor Space Photo',
      description: 'Add a photo of your yard, garden or terrace where you want to place the object',
      uploadButton: 'Upload Photo',
      dropzone: 'Click or drag photo here',
      formats: 'PNG, JPG or WEBP (max. 10MB)',
      camera: 'Take Photo',
      saved: 'Load Saved Objects',
      changePhoto: 'Change Photo',
      next: 'Continue',
      back: 'Back',
    },
    photoEdit: {
      title: 'Edit Your Space',
      description: 'Mark the area where you want to place the object',
      cropSpace: 'Mark Space',
      cropDescription: 'Drag points to mark the area for the object',
      eraseObjects: 'Erase Objects',
      eraseDescription: 'Remove unwanted objects from the photo',
      brushSize: 'Brush Size',
      reset: 'Reset',
      apply: 'Apply',
      next: 'Continue',
      back: 'Back',
    },
    objectGallery: {
      jacuzziTitle: 'Jacuzzi Models',
      poolTitle: 'Pool Models',
      otherTitle: 'Other Objects',
      jacuzziDescription: 'Choose the perfect jacuzzi for your space or upload your own',
      poolDescription: 'Choose the ideal pool for your yard or upload your own',
      otherDescription: 'Choose an object or upload your own',
      galleryTitle: 'Object Gallery',
      uploadCustomTitle: 'Upload Custom Object',
      uploadCustomDescription: 'Have your own photo? Add it here',
      selected: 'Selected:',
      confirm: 'Confirm Selection',
      or: 'or',
      back: 'Back',
    },
    galleryObjects: {
      jacuzziRound: 'Round Jacuzzi - Luxury',
      jacuzziSquare: 'Square Jacuzzi - Premium',
      jacuzziOutdoor: 'Outdoor Jacuzzi - Spa',
      jacuzziModern: 'Modern Jacuzzi - Minimalist',
      poolMondoAcqua1: 'Classic Rectangular Pool',
      poolMondoAcqua2: 'Modern Pool with Wooden Deck',
      poolMondoAcqua3: 'Elegant Pool with Cover',
      poolMondoAcqua4: 'White Edge Premium Pool',
      poolMondoAcqua5: 'Pool with Dome Cover - Family',
      poolMondoAcqua7: 'Modern Grey Edge Pool - Elegant',
      poolMondoAcqua8: 'Garden Pool with Wooden Deck - Premium',
      poolRectangular: 'Rectangular Pool - Classic',
      poolInfinity: 'Infinity Pool - Premium',
      poolRound: 'Round Pool - Compact',
      poolModern: 'Modern Pool - Designer',
      poolLuxury: 'Luxury Pool - Premium',
      poolCompact: 'Compact Pool - Minimalist',
      poolNatural: 'Natural Pool - Organic',
      poolLap: 'Lap Pool - Sports',
      sauna: 'Sauna - Outdoor',
      fountain: 'Fountain - Decorative',
      pond: 'Garden Pond',
      pergola: 'Pergola with Pool',
    },
    objectUpload: {
      title: 'Upload Object Photo',
      description: 'Add a photo of a pool, jacuzzi or other object',
      uploadButton: 'Upload Object',
      dropzone: 'Click or drag photo here',
      formats: 'PNG, JPG or WEBP (max. 10MB)',
      camera: 'Take Photo',
      saved: 'Save Object',
      next: 'Continue',
      back: 'Back',
    },
    objectCrop: {
      title: 'Isolate Object',
      description: 'Drag points to precisely crop the object',
      dragCorners: 'Drag corners to isolate the object',
      precision: 'Increase precision for better results',
      reset: 'Reset',
      apply: 'Apply',
      next: 'Continue',
      back: 'Back',
    },
    designCanvas: {
      title: 'Design & Transform',
      description: 'Your object has been automatically placed in the marked space',
      addAnother: 'Add Another Object',
      finish: 'Finish Project',
      back: 'Back',
      delete: 'Delete',
      objects: 'Objects',
    },
    results: {
      title: 'Your Project is Complete!',
      subtitle: 'Download the result or request a quote',
      before: 'Before',
      after: 'After',
      print: 'Print',
      downloadPdf: 'Download PDF',
      sendOffer: 'Send Quote Request',
      startNew: 'Start New Project',
      projectDetails: 'Project Details',
      type: 'Type',
      objects: 'Objects',
      exterior: 'Exterior',
      interior: 'Interior',
    },
    aiAssistant: {
      title: 'AI Assistant',
      placeholder: 'Ask a question...',
      tips: {
        photoUpload: 'Upload a clear photo of the outdoor space with good lighting.',
        photoEdit: 'Precisely mark the area where you want to place the object.',
        objectGallery: 'Choose an object from the gallery or upload your own.',
        objectUpload: 'Upload a photo of the object with a transparent background for best results.',
        objectCrop: 'Drag the corners to precisely isolate the object.',
        designCanvas: 'Your object has been automatically transformed and placed. You can add more objects.',
      },
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      or: 'or',
    },
  },
  
  de: {
    home: {
      title: 'Außengestaltung',
      subtitle: 'Visualisieren Sie Ihren perfekten Außenbereich mit professionellen Design-Tools',
      jacuzzi: {
        title: 'Jacuzzi',
        description: 'Platzieren Sie einen luxuriösen Jacuzzi in Ihrem Außenbereich',
      },
      pool: {
        title: 'Pool',
        description: 'Visualisieren Sie einen Pool mit perfekten Abmessungen',
      },
      other: {
        title: 'Andere',
        description: 'Fügen Sie ein beliebiges Objekt Ihrer Wahl hinzu',
      },
      select: 'Auswählen',
      selectQuestion: 'Welches Objekt möchten Sie platzieren?',
      workflow: 'Einfacher 5-Schritte-Prozess:',
      workflowSteps: 'Typ auswählen → Foto hochladen  Raum bearbeiten → Objekt hochladen → Objekt platzieren',
      poweredBy: 'Unterstützt von',
    },
    steps: {
      uploadSpace: 'Raum Hochladen',
      editSpace: 'Raum Bearbeiten',
      uploadObject: 'Objekt Hochladen',
      cropObject: 'Objekt Zuschneiden',
      placeObject: 'Objekt Platzieren',
    },
    photoUpload: {
      title: 'Außenbereich-Foto Hochladen',
      description: 'Fügen Sie ein Foto Ihres Gartens, Ihrer Terrasse hinzu, wo Sie das Objekt platzieren möchten',
      uploadButton: 'Foto Hochladen',
      dropzone: 'Klicken oder Foto hier ablegen',
      formats: 'PNG, JPG oder WEBP (max. 10MB)',
      camera: 'Foto Aufnehmen',
      saved: 'Gespeicherte Objekte Laden',
      changePhoto: 'Foto Ändern',
      next: 'Weiter',
      back: 'Zurück',
    },
    photoEdit: {
      title: 'Bearbeiten Sie Ihren Raum',
      description: 'Markieren Sie den Bereich, in dem Sie das Objekt platzieren möchten',
      cropSpace: 'Raum Markieren',
      cropDescription: 'Ziehen Sie Punkte, um den Bereich für das Objekt zu markieren',
      eraseObjects: 'Objekte Löschen',
      eraseDescription: 'Entfernen Sie unerwünschte Objekte vom Foto',
      brushSize: 'Pinselgröße',
      reset: 'Zurücksetzen',
      apply: 'Anwenden',
      next: 'Weiter',
      back: 'Zurück',
    },
    objectGallery: {
      jacuzziTitle: 'Jacuzzi-Modelle',
      poolTitle: 'Pool-Modelle',
      otherTitle: 'Andere Objekte',
      jacuzziDescription: 'Wählen Sie den perfekten Jacuzzi für Ihren Raum oder laden Sie Ihren eigenen hoch',
      poolDescription: 'Wählen Sie den idealen Pool für Ihren Garten oder laden Sie Ihren eigenen hoch',
      otherDescription: 'Wählen Sie ein Objekt oder laden Sie Ihr eigenes hoch',
      galleryTitle: 'Objektgalerie',
      uploadCustomTitle: 'Eigenes Objekt Hochladen',
      uploadCustomDescription: 'Haben Sie Ihr eigenes Foto? Fügen Sie es hier hinzu',
      selected: 'Ausgewählt:',
      confirm: 'Auswahl Bestätigen',
      or: 'oder',
      back: 'Zurück',
    },
    galleryObjects: {
      jacuzziRound: 'Runder Jacuzzi - Luxus',
      jacuzziSquare: 'Quadratischer Jacuzzi - Premium',
      jacuzziOutdoor: 'Außen-Jacuzzi - Spa',
      jacuzziModern: 'Moderner Jacuzzi - Minimalistisch',
      poolMondoAcqua1: 'Classic Rectangular Pool',
      poolMondoAcqua2: 'Modern Pool with Wooden Deck',
      poolMondoAcqua3: 'Elegant Pool with Cover',
      poolMondoAcqua4: 'White Edge Premium Pool',
      poolMondoAcqua5: 'Pool with Dome Cover - Family',
      poolMondoAcqua7: 'Modern Grey Edge Pool - Elegant',
      poolMondoAcqua8: 'Garden Pool with Wooden Deck - Premium',
      poolRectangular: 'Rechteckiger Pool - Klassisch',
      poolInfinity: 'Infinity-Pool - Premium',
      poolRound: 'Runder Pool - Kompakt',
      poolModern: 'Moderner Pool - Designer',
      poolLuxury: 'Luxus-Pool - Premium',
      poolCompact: 'Kompakter Pool - Minimalistisch',
      poolNatural: 'Natürlicher Pool - Organisch',
      poolLap: 'Schwimmbahn - Sport',
      sauna: 'Sauna - Außen',
      fountain: 'Brunnen - Dekorativ',
      pond: 'Gartenteich',
      pergola: 'Pergola mit Pool',
    },
    objectUpload: {
      title: 'Objekt-Foto Hochladen',
      description: 'Fügen Sie ein Foto eines Pools, Jacuzzis oder eines anderen Objekts hinzu',
      uploadButton: 'Objekt Hochladen',
      dropzone: 'Klicken oder Foto hier ablegen',
      formats: 'PNG, JPG oder WEBP (max. 10MB)',
      camera: 'Foto Aufnehmen',
      saved: 'Objekt Speichern',
      next: 'Weiter',
      back: 'Zurück',
    },
    objectCrop: {
      title: 'Objekt Isolieren',
      description: 'Ziehen Sie Punkte, um das Objekt präzise zuzuschneiden',
      dragCorners: 'Ziehen Sie Ecken, um das Objekt zu isolieren',
      precision: 'Erhöhen Sie die Präzision für bessere Ergebnisse',
      reset: 'Zurücksetzen',
      apply: 'Anwenden',
      next: 'Weiter',
      back: 'Zurück',
    },
    designCanvas: {
      title: 'Design & Transformation',
      description: 'Ihr Objekt wurde automatisch im markierten Bereich platziert',
      addAnother: 'Weiteres Objekt Hinzufügen',
      finish: 'Projekt Abschließen',
      back: 'Zurück',
      delete: 'Löschen',
      objects: 'Objekte',
    },
    results: {
      title: 'Ihr Projekt ist Fertig!',
      subtitle: 'Laden Sie das Ergebnis herunter oder fordern Sie ein Angebot an',
      before: 'Vorher',
      after: 'Nachher',
      print: 'Drucken',
      downloadPdf: 'PDF Herunterladen',
      sendOffer: 'Angebotsanfrage Senden',
      startNew: 'Neues Projekt Starten',
      projectDetails: 'Projektdetails',
      type: 'Typ',
      objects: 'Objekte',
      exterior: 'Außenbereich',
      interior: 'Innenbereich',
    },
    aiAssistant: {
      title: 'KI-Assistent',
      placeholder: 'Stellen Sie eine Frage...',
      tips: {
        photoUpload: 'Laden Sie ein klares Foto des Außenbereichs mit guter Beleuchtung hoch.',
        photoEdit: 'Markieren Sie präzise den Bereich, in dem Sie das Objekt platzieren möchten.',
        objectGallery: 'Wählen Sie ein Objekt aus der Galerie oder laden Sie Ihr eigenes hoch.',
        objectUpload: 'Laden Sie ein Foto des Objekts mit transparentem Hintergrund für beste Ergebnisse hoch.',
        objectCrop: 'Ziehen Sie die Ecken, um das Objekt präzise zu isolieren.',
        designCanvas: 'Ihr Objekt wurde automatisch transformiert und platziert. Sie können weitere Objekte hinzufügen.',
      },
    },
    common: {
      loading: 'Wird geladen...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      close: 'Schließen',
      or: 'oder',
    },
  },
  
  it: {
    home: {
      title: 'Design Esterno',
      subtitle: 'Visualizza il tuo spazio esterno perfetto con strumenti di design professionali',
      jacuzzi: {
        title: 'Jacuzzi',
        description: 'Posiziona una jacuzzi di lusso nel tuo spazio esterno',
      },
      pool: {
        title: 'Piscina',
        description: 'Visualizza una piscina con dimensioni perfette',
      },
      other: {
        title: 'Altro',
        description: 'Aggiungi qualsiasi altro oggetto di tua scelta',
      },
      select: 'Seleziona',
      selectQuestion: 'Quale oggetto vuoi posizionare?',
      workflow: 'Processo semplice in 5 passaggi:',
      workflowSteps: 'Seleziona tipo → Carica foto → Modifica spazio → Carica oggetto → Posiziona oggetto',
      poweredBy: 'Powered by',
    },
    steps: {
      uploadSpace: 'Carica Spazio',
      editSpace: 'Modifica Spazio',
      uploadObject: 'Carica Oggetto',
      cropObject: 'Ritaglia Oggetto',
      placeObject: 'Posiziona Oggetto',
    },
    photoUpload: {
      title: 'Carica Foto Spazio Esterno',
      description: 'Aggiungi una foto del tuo giardino, terrazza dove vuoi posizionare l\'oggetto',
      uploadButton: 'Carica Foto',
      dropzone: 'Clicca o trascina la foto qui',
      formats: 'PNG, JPG o WEBP (max. 10MB)',
      camera: 'Scatta Foto',
      saved: 'Carica Oggetti Salvati',
      changePhoto: 'Cambia Foto',
      next: 'Continua',
      back: 'Indietro',
    },
    photoEdit: {
      title: 'Modifica il Tuo Spazio',
      description: 'Segna l\'area dove vuoi posizionare l\'oggetto',
      cropSpace: 'Segna Spazio',
      cropDescription: 'Trascina i punti per segnare l\'area per l\'oggetto',
      eraseObjects: 'Cancella Oggetti',
      eraseDescription: 'Rimuovi oggetti indesiderati dalla foto',
      brushSize: 'Dimensione Pennello',
      reset: 'Ripristina',
      apply: 'Applica',
      next: 'Continua',
      back: 'Indietro',
    },
    objectGallery: {
      jacuzziTitle: 'Modelli Jacuzzi',
      poolTitle: 'Modelli Piscina',
      otherTitle: 'Altri Oggetti',
      jacuzziDescription: 'Scegli la jacuzzi perfetta per il tuo spazio o carica la tua',
      poolDescription: 'Scegli la piscina ideale per il tuo giardino o carica la tua',
      otherDescription: 'Scegli un oggetto o carica il tuo',
      galleryTitle: 'Galleria Oggetti',
      uploadCustomTitle: 'Carica Oggetto Personalizzato',
      uploadCustomDescription: 'Hai la tua foto? Aggiungila qui',
      selected: 'Selezionato:',
      confirm: 'Conferma Selezione',
      or: 'o',
      back: 'Indietro',
    },
    galleryObjects: {
      jacuzziRound: 'Jacuzzi Rotonda - Lusso',
      jacuzziSquare: 'Jacuzzi Quadrata - Premium',
      jacuzziOutdoor: 'Jacuzzi Esterna - Spa',
      jacuzziModern: 'Jacuzzi Moderna - Minimalista',
      poolMondoAcqua1: 'Classic Rectangular Pool',
      poolMondoAcqua2: 'Modern Pool with Wooden Deck',
      poolMondoAcqua3: 'Elegant Pool with Cover',
      poolMondoAcqua4: 'White Edge Premium Pool',
      poolMondoAcqua5: 'Pool with Dome Cover - Family',
      poolMondoAcqua7: 'Modern Grey Edge Pool - Elegant',
      poolMondoAcqua8: 'Garden Pool with Wooden Deck - Premium',
      poolRectangular: 'Piscina Rettangolare - Classica',
      poolInfinity: 'Piscina Infinity - Premium',
      poolRound: 'Piscina Rotonda - Compatta',
      poolModern: 'Piscina Moderna - Designer',
      poolLuxury: 'Piscina di Lusso - Premium',
      poolCompact: 'Piscina Compatta - Minimalista',
      poolNatural: 'Piscina Naturale - Organica',
      poolLap: 'Piscina per Nuoto - Sport',
      sauna: 'Sauna - Esterna',
      fountain: 'Fontana - Decorativa',
      pond: 'Laghetto da Giardino',
      pergola: 'Pergola con Piscina',
    },
    objectUpload: {
      title: 'Carica Foto Oggetto',
      description: 'Aggiungi una foto di una piscina, jacuzzi o altro oggetto',
      uploadButton: 'Carica Oggetto',
      dropzone: 'Clicca o trascina la foto qui',
      formats: 'PNG, JPG o WEBP (max. 10MB)',
      camera: 'Scatta Foto',
      saved: 'Salva Oggetto',
      next: 'Continua',
      back: 'Indietro',
    },
    objectCrop: {
      title: 'Isola Oggetto',
      description: 'Trascina i punti per ritagliare con precisione l\'oggetto',
      dragCorners: 'Trascina gli angoli per isolare l\'oggetto',
      precision: 'Aumenta la precisione per risultati migliori',
      reset: 'Ripristina',
      apply: 'Applica',
      next: 'Continua',
      back: 'Indietro',
    },
    designCanvas: {
      title: 'Design e Trasformazione',
      description: 'Il tuo oggetto è stato posizionato automaticamente nello spazio segnato',
      addAnother: 'Aggiungi Altro Oggetto',
      finish: 'Completa Progetto',
      back: 'Indietro',
      delete: 'Elimina',
      objects: 'Oggetti',
    },
    results: {
      title: 'Il Tuo Progetto è Completo!',
      subtitle: 'Scarica il risultato o richiedi un preventivo',
      before: 'Prima',
      after: 'Dopo',
      print: 'Stampa',
      downloadPdf: 'Scarica PDF',
      sendOffer: 'Invia Richiesta Preventivo',
      startNew: 'Inizia Nuovo Progetto',
      projectDetails: 'Dettagli Progetto',
      type: 'Tipo',
      objects: 'Oggetti',
      exterior: 'Esterno',
      interior: 'Interno',
    },
    aiAssistant: {
      title: 'Assistente AI',
      placeholder: 'Fai una domanda...',
      tips: {
        photoUpload: 'Carica una foto chiara dello spazio esterno con buona illuminazione.',
        photoEdit: 'Segna con precisione l\'area dove vuoi posizionare l\'oggetto.',
        objectGallery: 'Scegli un oggetto dalla galleria o carica il tuo.',
        objectUpload: 'Carica una foto dell\'oggetto con sfondo trasparente per i migliori risultati.',
        objectCrop: 'Trascina gli angoli per isolare con precisione l\'oggetto.',
        designCanvas: 'Il tuo oggetto è stato automaticamente trasformato e posizionato. Puoi aggiungere più oggetti.',
      },
    },
    common: {
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      cancel: 'Annulla',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      close: 'Chiudi',
      or: 'o',
    },
  },
};