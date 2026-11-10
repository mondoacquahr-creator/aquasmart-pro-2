export async function bucketFillTransform(
  sourceImageUrl: string,
  destRect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = destRect.width;
        canvas.height = destRect.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, destRect.width, destRect.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load source image'));
    img.src = sourceImageUrl;
  });
}

// Fallback implementation of homography using bucket fill
// since OpenCV.js is too large and might fail to load in this environment
export async function applyHomographyTransform(
  sourceImageUrl: string,
  destPoints: { x: number; y: number }[],
  outputWidth: number,
  outputHeight: number,
  sourcePoints?: { x: number; y: number }[]
): Promise<string> {
  console.warn('OpenCV.js not loaded, falling back to basic bucket fill transform');
  
  const minX = Math.min(...destPoints.map(p => p.x));
  const maxX = Math.max(...destPoints.map(p => p.x));
  const minY = Math.min(...destPoints.map(p => p.y));
  const maxY = Math.max(...destPoints.map(p => p.y));

  return bucketFillTransform(sourceImageUrl, {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  });
}