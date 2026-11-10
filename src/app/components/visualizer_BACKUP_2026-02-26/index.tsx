import React, { useState } from 'react';
import { toast, Toaster } from 'sonner@2.0.3';
import { ProjectData, DesignObject } from './types';
import { HomeScreen, PhotoUploadStep, PhotoEditStep, ObjectGalleryStep } from './Steps1';
import { ObjectUploadStep, ObjectCropStep, DesignCanvasStep, ResultsStep } from './Steps2';
import { StepNavigation, AIAssistant } from './SharedUI';
import { applyHomographyTransform, bucketFillTransform, loadOpenCV } from './utils';

type Step = 'photo-upload' | 'photo-edit' | 'object-gallery' | 'object-upload' | 'object-crop' | 'design-canvas' | 'results';

function AppContent() {
  const [showHome, setShowHome] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('photo-upload');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // ⚡ NEW
  const [projectData, setProjectData] = useState<ProjectData>({
    projectType: 'exterior',
    roomPhoto: null,
    editedPhoto: null,
    objects: [],
  });

  const [spacePhotoDimensions, setSpacePhotoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [spaceCropPoints, setSpaceCropPoints] = useState<Array<{x: number, y: number}> | null>(null);
  const [currentObjectUpload, setCurrentObjectUpload] = useState<{ url: string; name: string } | null>(null);

  // ⚡ REMOVED: No pre-loading of OpenCV! Load only when needed.

  const handlePhotoNext = async (photoUrl: string, photoDimensions: { width: number; height: number }) => {
    console.log('🟡 1. handlePhotoNext called');
    console.log('🟡 2. photoUrl length:', photoUrl.length);
    console.log('🟡 3. photoDimensions:', photoDimensions);
    
    try {
      console.log('🟡 4. Setting projectData...');
      setProjectData({ 
        ...projectData, 
        roomPhoto: photoUrl,
        roomPhotoDimensions: photoDimensions 
      });
      setSpacePhotoDimensions(photoDimensions); // ⚡ ALSO set space dimensions!
      console.log('🟡 5. ✅ projectData set!');
      
      console.log('🟡 6. Setting currentStep to photo-edit...');
      setCurrentStep('photo-edit');
      console.log('🟡 7. ✅ currentStep set to photo-edit!');
    } catch (error) {
      console.error('🟡 ❌ ERROR in handlePhotoNext:', error);
      toast.error('Greška pri obradi slike: ' + error);
    }
  };

  const handlePhotoEditNext = (points: Array<{x: number, y: number}>, cropArea: { x: number; y: number; width: number; height: number }) => {
    setProjectData({
      ...projectData,
      spaceCropArea: cropArea,
      spaceCropPolygonPoints: points,
      spaceCropCanvasSize: spacePhotoDimensions || undefined,
    });
    setSpaceCropPoints(points);
    setCurrentStep('object-gallery');
    setCompletedSteps([...completedSteps, 'photo-edit']);
  };

  const handleObjectGalleryNext = () => {
    console.log('🟡 ObjectGallery Next clicked');
    setCurrentStep('object-upload');
    setCompletedSteps([...completedSteps, 'object-gallery']);
    console.log('🟡 Navigation to object-upload complete');
    
    // ⚡⚡⚡ REMOVED OpenCV pre-loading from here - moved to ObjectCropStep mount
    // This was causing UI freeze when clicking "Next"
  };

  const handleObjectUploadNext = (objectUrl: string, objectName: string) => {
    console.log('🟢 1. handleObjectUploadNext called with:', objectName);
    console.log('🟢 2. objectUrl length:', objectUrl.length);
    console.log('🟢 3. Current step BEFORE:', currentStep);
    
    setCurrentObjectUpload({ url: objectUrl, name: objectName });
    console.log('🟢 4. setCurrentObjectUpload called');
    
    setCurrentStep('object-crop');
    console.log('🟢 5. setCurrentStep called, should be object-crop now');
    
    // Force immediate re-render
    setTimeout(() => {
      console.log('🟢 6. setTimeout - currentStep should be:', currentStep);
    }, 100);
  };

  const handleObjectCropNext = async (croppedObjectUrl: string, objectCropPoints?: Array<{x: number, y: number}>) => {
    console.log('🟩 1. handleObjectCropNext called');
    console.log('🟩 2. croppedObjectUrl length:', croppedObjectUrl.length);
    console.log('🟩 3. objectCropPoints:', objectCropPoints);
    
    if (!projectData.roomPhoto || !spaceCropPoints || !spacePhotoDimensions) {
      toast.error('Greška: nedostaju podaci o prostoru');
      return;
    }

    console.log('🟩 4. Starting transform...');
    toast.loading('Primjenjujem perspektivu...');

    try {
      // ⚡⚡⚡ SKIP OpenCV for now - use BUCKET FILL ONLY!
      console.log('⚡ Using bucket fill transform (OpenCV temporarily disabled)...');
      
      // Calculate bounding box from spaceCropPoints
      const xs = spaceCropPoints.map(p => p.x);
      const ys = spaceCropPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      
      console.log('🟩 5. Calling bucketFillTransform...');
      const transformedUrl = await bucketFillTransform(
        croppedObjectUrl,
        { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
        spacePhotoDimensions.width,
        spacePhotoDimensions.height
      );
      console.log('🟩 6. Bucket fill succeeded!');

      const newObject: DesignObject = {
        id: Date.now().toString(),
        name: currentObjectUpload?.name || 'Pool',
        imageUrl: transformedUrl,
        position: { x: 0, y: 0 }, // ⚡⚡⚡ FULL CANVAS = (0,0)
        displayWidth: spacePhotoDimensions.width,
        displayHeight: spacePhotoDimensions.height,
        rotation: 0,
      };

      console.log('🟩 7. Setting objects and navigating to design-canvas...');
      setProjectData({ ...projectData, objects: [newObject] });
      setCurrentStep('design-canvas');
      toast.dismiss();
      toast.success('Bazen uspješno primijenjen!');
      console.log('🟩 8. Done!');
    } catch (error) {
      console.error('❌ Transform failed:', error);
      toast.dismiss();
      toast.error('Greška pri transformaciji');
    }
  };

  const handleDesignCanvasNext = (finalImageUrl: string) => {
    setProjectData({ ...projectData, editedPhoto: finalImageUrl });
    setCurrentStep('results');
    setCompletedSteps([...completedSteps, 'design-canvas']);
  };

  const handleStartNew = () => {
    setShowHome(true);
    setCurrentStep('photo-upload');
    setCompletedSteps([]);
    setProjectData({
      projectType: 'exterior',
      roomPhoto: null,
      editedPhoto: null,
      objects: [],
    });
    setSpacePhotoDimensions(null);
    setSpaceCropPoints(null);
    setCurrentObjectUpload(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {!showHome && currentStep !== 'photo-upload' && (
        <div className="fixed top-0 w-full z-50 p-4">
          <StepNavigation 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
            onNavigate={setCurrentStep} 
          />
        </div>
      )}
      
      <div className={!showHome && currentStep !== 'photo-upload' ? 'pt-24 relative z-10' : 'relative z-10'}>
        {showHome ? (
          <HomeScreen onStart={() => setShowHome(false)} />
        ) : (
          <>
            {currentStep === 'photo-upload' && (
              <PhotoUploadStep onNext={handlePhotoNext} />
            )}
            {currentStep === 'photo-edit' && projectData.roomPhoto && projectData.roomPhotoDimensions && (
              <PhotoEditStep 
                photo={projectData.roomPhoto} 
                dimensions={projectData.roomPhotoDimensions}
                onNext={handlePhotoEditNext} 
                onBack={() => setCurrentStep('photo-upload')} 
              />
            )}
            {currentStep === 'object-gallery' && (
              <ObjectGalleryStep onNext={handleObjectGalleryNext} onBack={() => setCurrentStep('photo-edit')} />
            )}
            {currentStep === 'object-upload' && (
              <ObjectUploadStep onNext={handleObjectUploadNext} onBack={() => setCurrentStep('object-gallery')} />
            )}
            {currentStep === 'object-crop' && currentObjectUpload && (
              <ObjectCropStep 
                objectUrl={currentObjectUpload.url}
                onNext={handleObjectCropNext} 
                onBack={() => setCurrentStep('object-upload')} 
              />
            )}
            {currentStep === 'design-canvas' && projectData.roomPhoto && (
              <DesignCanvasStep 
                photo={projectData.roomPhoto}
                objects={projectData.objects}
                spaceCropCanvasSize={projectData.spaceCropCanvasSize}
                onFinish={handleDesignCanvasNext}
                onBack={() => setCurrentStep('object-crop')} 
              />
            )}
            {currentStep === 'results' && projectData.editedPhoto && (
              <ResultsStep 
                finalImage={projectData.editedPhoto}
                onStartNew={handleStartNew} 
              />
            )}
          </>
        )}
      </div>
      
      {!showHome && currentStep !== 'photo-upload' && <AIAssistant currentStep={currentStep} />}
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

export default function VisualizerApp() {
  return <AppContent />;
}
