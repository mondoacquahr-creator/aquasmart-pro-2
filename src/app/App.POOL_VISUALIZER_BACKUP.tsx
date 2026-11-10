// ===================================
// POOL VISUALIZER STANDALONE APP
// BACKUP - Not currently in use
// ===================================
// This was the standalone Pool Visualizer app
// Now integrated into /components/visualizer/
// and accessible via /app/pool-visualizer route
// ===================================

import { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { HomeScreen } from './components/HomeScreen';
import { PhotoUploadStep } from './components/steps/PhotoUploadStep';
import { PhotoEditStep } from './components/steps/PhotoEditStep';
import { ObjectGalleryStep } from './components/steps/ObjectGalleryStep';
import { ObjectUploadStep } from './components/steps/ObjectUploadStep';
import { ObjectCropStep } from './components/steps/ObjectCropStep';
import { DesignCanvasStep } from './components/steps/DesignCanvasStep';
import { ResultsStep } from './components/steps/ResultsStep';
import { StepNavigation } from './components/StepNavigation';
import { AIAssistant } from './components/AIAssistant';
import { LanguageSelector } from './components/LanguageSelector';
import { ProjectData, DesignObject, ObjectDimensions, Line } from './types';
import { applyHomographyTransform, bucketFillTransform } from './utils/perspectiveTransform';
import { Toaster } from 'sonner@2.0.3';

type Step = 'photo-upload' | 'photo-edit' | 'object-gallery' | 'object-upload' | 'object-crop' | 'design-canvas' | 'results';

interface GalleryObject {
  id: string;
  name: string;
  imageUrl: string;
  category: 'bazen';
  thumbnail: string;
}

function AppContent() {
  const [showHome, setShowHome] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('photo-upload');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [isObjectFromGallery, setIsObjectFromGallery] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    projectType: 'exterior', // Fixed to exterior only
    roomDimensions: { width: 800, height: 600, depth: 400 },
    roomPhoto: null,
    editedPhoto: null,
    boundaryLines: [],
    objects: [],
  });
  const [currentObjectUpload, setCurrentObjectUpload] = useState<{
    imageUrl: string;
    name: string;
  } | null>(null);
  const [spacePhotoDimensions, setSpacePhotoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [spaceCropPoints, setSpaceCropPoints] = useState<Array<{x: number, y: number}> | null>(null);
  const [finalCompositeImage, setFinalCompositeImage] = useState<string | null>(null);

  const markStepCompleted = (step: Step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const navigateToStep = (step: Step) => {
    if (completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  const handlePhotoUploadNext = (photo: string) => {
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setSpacePhotoDimensions({ width: img.width, height: img.height });
    };
    img.src = photo;
    
    setProjectData({ ...projectData, roomPhoto: photo });
    markStepCompleted('photo-upload');
    setCurrentStep('photo-edit');
  };

  const handlePhotoEditNext = (
    editedPhoto: string,
    needsErase: boolean,
    spaceCropArea?: { x: number; y: number; width: number; height: number },
    canvasSize?: { width: number; height: number },
    spaceCropPoints?: Array<{x: number, y: number}>
  ) => {
    console.log('=== PHOTO EDIT COMPLETE ===');
    console.log('Edited photo length:', editedPhoto.length);
    console.log('Space crop area received:', spaceCropArea);
    console.log('Space crop POINTS received:', spaceCropPoints);
    console.log('Canvas size received:', canvasSize);
    
    setProjectData({ ...projectData, editedPhoto, spaceCropArea });
    if (canvasSize) {
      setSpacePhotoDimensions(canvasSize);
    }
    if (spaceCropPoints) {
      setSpaceCropPoints(spaceCropPoints);
    }
    markStepCompleted('photo-edit');
    setCurrentStep('object-gallery');
  };

  const handleObjectGalleryNext = (galleryObject: GalleryObject) => {
    console.log('🎨 App: handleObjectGalleryNext called with:', galleryObject);
    setIsObjectFromGallery(true);
    handleObjectUploadNext(galleryObject.imageUrl, galleryObject.name);
  };

  const handleObjectUploadNext = (imageUrl: string, name: string) => {
    setCurrentObjectUpload({ imageUrl, name });
    markStepCompleted('object-upload');
    setCurrentStep('object-crop');
  };

  const handleObjectCropNext = async (croppedImageUrl: string, objectCropPoints?: Array<{x: number, y: number}>) => {
    if (!currentObjectUpload) return;

    console.log('=== OBJECT CROP COMPLETE ===');
    console.log('Cropped image URL length:', croppedImageUrl.length);
    console.log('Object crop points:', objectCropPoints);

    // Load the cropped image to get its actual dimensions
    const img = new Image();
    img.onload = async () => {
      console.log('Cropped object loaded:', { width: img.width, height: img.height });
      console.log('Space crop area:', projectData.spaceCropArea);
      console.log('Space photo dimensions:', spacePhotoDimensions);
      
      let finalImageUrl = croppedImageUrl;
      let displayWidth, displayHeight, posX, posY;
      
      const canvasWidth = spacePhotoDimensions?.width || 800;
      const canvasHeight = spacePhotoDimensions?.height || 600;
      
      if (projectData.spaceCropArea && spaceCropPoints && objectCropPoints) {
        // PERSPECTIVE MODE: Transform object to match space perspective
        console.log('🎯 PERSPECTIVE MODE ENABLED');
        console.log('Space polygon points (4 corners):', spaceCropPoints);
        console.log('Object polygon points (4 corners):', objectCropPoints);
        
        try {
          console.log('Applying homography transformation...');
          finalImageUrl = await applyHomographyTransform(
            croppedImageUrl,
            spaceCropPoints,
            canvasWidth,
            canvasHeight,
            objectCropPoints
          );
          console.log('✅ Homography transform complete, transformed image ready');
          
          // ✨ NEW: Image is now FULL canvas size with object at correct position
          // Position is (0, 0) and size is full canvas
          displayWidth = canvasWidth;
          displayHeight = canvasHeight;
          posX = 0;
          posY = 0;
          
          console.log('📦 NEW OBJECT CREATED (FULL CANVAS MODE):');
          console.log('  Space crop area:', projectData.spaceCropArea);
          console.log('  Object position:', { x: posX, y: posY });
          console.log('  Object display size:', { width: displayWidth, height: displayHeight });
        } catch (error) {
          console.error('❌ Homography transform failed:', error);
          // Fallback to bucket fill
          console.log('⚠️ Falling back to bucket fill mode');
          try {
            finalImageUrl = await bucketFillTransform(
              croppedImageUrl,
              projectData.spaceCropArea,
              canvasWidth,
              canvasHeight
            );
            
            // ✨ NEW: Image is now FULL canvas size with object at correct position
            displayWidth = canvasWidth;
            displayHeight = canvasHeight;
            posX = 0;
            posY = 0;
          } catch (bucketError) {
            console.error('❌ Bucket fill also failed:', bucketError);
            // Final fallback to original dimensions
            const objectAspectRatio = img.width / img.height;
            displayWidth = 250;
            displayHeight = displayWidth / objectAspectRatio;
            posX = 150;
            posY = 150;
          }
        }
      } else if (projectData.spaceCropArea) {
        // BUCKET FILL MODE: Transform object to fit exact space
        console.log('🪣 BUCKET FILL MODE - No polygon points available');
        try {
          finalImageUrl = await bucketFillTransform(
            croppedImageUrl,
            projectData.spaceCropArea,
            canvasWidth,
            canvasHeight
          );
          console.log('✅ Bucket fill complete, transformed image ready');
          
          // ✨ NEW: Image is now FULL canvas size with object at correct position
          displayWidth = canvasWidth;
          displayHeight = canvasHeight;
          posX = 0;
          posY = 0;
          
          console.log('📦 NEW OBJECT CREATED (FULL CANVAS MODE):');
          console.log('  Space crop area:', projectData.spaceCropArea);
          console.log('  Object position:', { x: posX, y: posY });
          console.log('  Object display size:', { width: displayWidth, height: displayHeight });
        } catch (error) {
          console.error('❌ Bucket fill failed:', error);
          // Fallback to original dimensions
          const objectAspectRatio = img.width / img.height;
          displayWidth = 250;
          displayHeight = displayWidth / objectAspectRatio;
          posX = 150;
          posY = 150;
        }
      } else {
        // Fallback: default sizing if no space crop area
        const objectAspectRatio = img.width / img.height;
        displayWidth = 250;
        displayHeight = displayWidth / objectAspectRatio;
        posX = 150 + (projectData.objects.length * 50);
        posY = 150 + (projectData.objects.length * 30);
        console.log('⚠️ Using default mode - no space crop area');
      }

      const newObject: DesignObject = {
        id: `obj-${Date.now()}`,
        type: 'custom',
        name: currentObjectUpload.name,
        imageUrl: finalImageUrl, // Use the transformed image
        position: { x: posX, y: posY },
        rotation: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        dimensions: {
          width: img.width,
          height: img.height,
          depth: 50,
        },
        displayWidth,
        displayHeight,
      };

      console.log('📦 NEW OBJECT CREATED:', newObject);

      const updatedObjects = [...projectData.objects, newObject];
      
      setProjectData({ ...projectData, objects: updatedObjects });
      markStepCompleted('object-crop');
      setCurrentStep('design-canvas');
      
      console.log('=== NAVIGATING TO DESIGN CANVAS ===');
    };

    img.onerror = () => {
      console.error('❌ Failed to load cropped image!');
    };

    img.src = croppedImageUrl;
  };

  const handleUpdateObjects = (objects: DesignObject[]) => {
    setProjectData({ ...projectData, objects });
  };

  const handleAddAnotherObject = () => {
    setCurrentStep('object-gallery');
  };

  const handleFinishDesign = (compositeImageUrl: string) => {
    console.log('=== DESIGN FINISHED ===');
    console.log('Composite image captured:', compositeImageUrl.length);
    setFinalCompositeImage(compositeImageUrl);
    markStepCompleted('design-canvas');
    setCurrentStep('results');
  };

  const handleStartNewProject = () => {
    // Reset all state
    setCurrentStep('photo-upload');
    setCompletedSteps([]);
    setProjectData({
      projectType: 'exterior', // Fixed to exterior only
      roomDimensions: { width: 800, height: 600, depth: 400 },
      roomPhoto: null,
      editedPhoto: null,
      boundaryLines: [],
      objects: [],
    });
    setCurrentObjectUpload(null);
    setSpacePhotoDimensions(null);
    setSpaceCropPoints(null);
    setFinalCompositeImage(null);
    setShowHome(true);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen relative bg-slate-950 overflow-hidden">
        {/* Simple gradient background - no heavy animations */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-cyan-950/40 to-blue-950/60" />
        
        {/* Step Navigation - Show on all steps except the first */}
        {currentStep !== 'photo-upload' && !showHome && (
          <div className="fixed top-0 left-0 right-0 z-50 p-4">
            <div className="max-w-7xl mx-auto">
              <StepNavigation
                currentStep={currentStep}
                completedSteps={completedSteps}
                onNavigate={navigateToStep}
                projectType={projectData.projectType}
              />
            </div>
          </div>
        )}

        {/* Add padding to content when navigation is shown */}
        <div className={currentStep !== 'photo-upload' && !showHome ? 'pt-24 md:pt-28 relative z-10' : 'relative z-10'}>
          {showHome ? (
            <HomeScreen
              onStart={() => setShowHome(false)}
            />
          ) : (
            <>
              {currentStep === 'photo-upload' && (
                <PhotoUploadStep
                  initialPhoto={projectData.roomPhoto}
                  onNext={handlePhotoUploadNext}
                />
              )}

              {currentStep === 'photo-edit' && projectData.roomPhoto && (
                <PhotoEditStep
                  photo={projectData.roomPhoto}
                  initialEditedPhoto={projectData.editedPhoto}
                  onNext={handlePhotoEditNext}
                  onBack={() => setCurrentStep('photo-upload')}
                />
              )}

              {currentStep === 'object-gallery' && (
                <ObjectGalleryStep
                  selectedObjectType={'bazen'}
                  onSelectFromGallery={handleObjectGalleryNext}
                  onUploadCustom={() => {
                    setIsObjectFromGallery(false);
                    setCurrentStep('object-upload');
                  }}
                  onBack={() => setCurrentStep('photo-edit')}
                />
              )}

              {currentStep === 'object-upload' && (
                <ObjectUploadStep
                  onAddObject={handleObjectUploadNext}
                  onBack={() => setCurrentStep('object-gallery')}
                />
              )}

              {currentStep === 'object-crop' && currentObjectUpload && (
                <ObjectCropStep
                  photo={currentObjectUpload.imageUrl}
                  objectName={currentObjectUpload.name}
                  spaceCropArea={projectData.spaceCropArea}
                  onNext={handleObjectCropNext}
                  onBack={() => setCurrentStep(isObjectFromGallery ? 'object-gallery' : 'object-upload')}
                />
              )}

              {currentStep === 'design-canvas' && (projectData.editedPhoto || projectData.roomPhoto) && (
                <DesignCanvasStep
                  photo={(projectData.editedPhoto || projectData.roomPhoto)!}
                  roomDimensions={projectData.roomDimensions}
                  boundaryLines={projectData.boundaryLines}
                  objects={projectData.objects}
                  projectType={projectData.projectType}
                  spaceCropCanvasSize={spacePhotoDimensions || undefined}
                  spaceCropPolygonPoints={spaceCropPoints || undefined}
                  onUpdateObjects={handleUpdateObjects}
                  onBack={() => setCurrentStep('object-crop')}
                  onAddAnother={handleAddAnotherObject}
                  onFinish={handleFinishDesign}
                />
              )}

              {currentStep === 'results' && finalCompositeImage && projectData.roomPhoto && (
                <ResultsStep
                  compositeImageUrl={finalCompositeImage}
                  originalPhotoUrl={projectData.roomPhoto}
                  onStartNew={handleStartNewProject}
                />
              )}
            </>
          )}
        </div>

        {/* AI Assistant - Show on all steps except the first */}
        {!showHome && currentStep !== 'photo-upload' && (
          <AIAssistant
            currentStep={currentStep}
            projectType={projectData.projectType}
          />
        )}

        {/* Language Selector - Fixed top right */}
        {!showHome && currentStep !== 'photo-upload' && (
          <div className="fixed top-4 right-4 z-50">
            <LanguageSelector variant="app" />
          </div>
        )}

        {/* Toaster for notifications */}
        <Toaster 
          position="top-center"
          theme="dark"
          richColors
        />
      </div>
    </LanguageProvider>
  );
}

// Main App component wrapper
export default function App() {
  return <AppContent />;
}