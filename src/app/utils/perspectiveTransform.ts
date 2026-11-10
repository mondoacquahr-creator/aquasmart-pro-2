/**
 * Apply perspective transformation (homography) to map a source image
 * into a destination quadrilateral region
 */
export async function applyHomographyTransform(
  sourceImageUrl: string,
  destPoints: { x: number; y: number }[], // 4 corner points [TL, TR, BR, BL]
  outputWidth: number,
  outputHeight: number,
  sourcePoints?: { x: number; y: number }[] // Optional: source polygon points for trapezoid→trapezoid mapping
): Promise<string> {
  // ⚡ DYNAMIC IMPORT - OpenCV only loads when needed (8MB+ library!)
  const cv = (await import('@techstark/opencv-js')).default;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        console.log('🎯 Starting homography transform...');
        console.log('Source image:', { width: img.width, height: img.height });
        console.log('Destination points:', destPoints);
        console.log('Source points provided:', sourcePoints);
        console.log('Output size:', { width: outputWidth, height: outputHeight });

        // Create source and destination matrices
        const src = cv.imread(img);
        
        // Source points: use provided sourcePoints if available (trapezoid), otherwise use full image rectangle
        const defaultSrcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,                    // Top-left
          src.cols, 0,            // Top-right
          src.cols, src.rows,     // Bottom-right
          0, src.rows             // Bottom-left
        ]);

        const finalSrcPoints = sourcePoints ? cv.matFromArray(4, 1, cv.CV_32FC2, [
          sourcePoints[0].x, sourcePoints[0].y,  // TL
          sourcePoints[1].x, sourcePoints[1].y,  // TR
          sourcePoints[2].x, sourcePoints[2].y,  // BR
          sourcePoints[3].x, sourcePoints[3].y   // BL
        ]) : defaultSrcPoints;

        console.log('📐 SOURCE POLYGON:');
        if (sourcePoints) {
          console.log('  Using CUSTOM trapezoid:', sourcePoints);
        } else {
          console.log('  Using FULL RECTANGLE:', [
            {x: 0, y: 0},
            {x: src.cols, y: 0},
            {x: src.cols, y: src.rows},
            {x: 0, y: src.rows}
          ]);
        }

        // Calculate bounding box for destination
        const minX = Math.min(...destPoints.map(p => p.x));
        const maxX = Math.max(...destPoints.map(p => p.x));
        const minY = Math.min(...destPoints.map(p => p.y));
        const maxY = Math.max(...destPoints.map(p => p.y));

        const boundingWidth = maxX - minX;
        const boundingHeight = maxY - minY;

        console.log('Bounding box:', { minX, maxX, minY, maxY, boundingWidth, boundingHeight });

        // Destination points (adjusted to bounding box origin)
        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          destPoints[0].x - minX, destPoints[0].y - minY,  // TL
          destPoints[1].x - minX, destPoints[1].y - minY,  // TR
          destPoints[2].x - minX, destPoints[2].y - minY,  // BR
          destPoints[3].x - minX, destPoints[3].y - minY   // BL
        ]);

        // Calculate homography matrix
        console.log('Computing homography matrix...');
        const H = cv.getPerspectiveTransform(finalSrcPoints, dstPoints);
        
        // Create output matrix
        const dst = new cv.Mat();
        const dsize = new cv.Size(Math.ceil(boundingWidth), Math.ceil(boundingHeight));

        // Apply perspective warp
        console.log('Applying warp perspective...');
        cv.warpPerspective(
          src, 
          dst, 
          H, 
          dsize,
          cv.INTER_LINEAR,
          cv.BORDER_CONSTANT,
          new cv.Scalar(0, 0, 0, 0) // Transparent border
        );

        // ✅ CREATE A MASK to only show the polygon area
        console.log('Creating polygon mask...');
        const mask = new cv.Mat.zeros(dsize.height, dsize.width, cv.CV_8UC1);
        
        // Adjusted destination points (relative to bounding box)
        const maskPoints = [
          new cv.Point(destPoints[0].x - minX, destPoints[0].y - minY),
          new cv.Point(destPoints[1].x - minX, destPoints[1].y - minY),
          new cv.Point(destPoints[2].x - minX, destPoints[2].y - minY),
          new cv.Point(destPoints[3].x - minX, destPoints[3].y - minY)
        ];
        
        const contours = new cv.MatVector();
        const contour = cv.matFromArray(4, 1, cv.CV_32SC2, [
          maskPoints[0].x, maskPoints[0].y,
          maskPoints[1].x, maskPoints[1].y,
          maskPoints[2].x, maskPoints[2].y,
          maskPoints[3].x, maskPoints[3].y
        ]);
        contours.push_back(contour);
        
        // Fill the polygon with white (255)
        cv.fillPoly(mask, contours, new cv.Scalar(255));
        
        console.log('Converting to RGBA and applying alpha mask...');
        // Convert BGR to BGRA (add alpha channel)
        const dstRGBA = new cv.Mat();
        cv.cvtColor(dst, dstRGBA, cv.COLOR_RGB2RGBA);
        
        // Split into channels
        const channels = new cv.MatVector();
        cv.split(dstRGBA, channels);
        
        // Use mask as alpha channel
        const alpha = channels.get(3);
        mask.copyTo(alpha);
        channels.set(3, alpha);
        
        // Merge back
        const result = new cv.Mat();
        cv.merge(channels, result);

        // Convert to canvas and get data URL
        const canvas = document.createElement('canvas');
        cv.imshow(canvas, result);
        const dataUrl = canvas.toDataURL('image/png');

        console.log('✅ Homography transform complete!');
        console.log('Output data URL length:', dataUrl.length);

        // Clean up
        src.delete();
        dst.delete();
        H.delete();
        finalSrcPoints.delete();
        dstPoints.delete();
        mask.delete();
        contours.delete();
        contour.delete();
        dstRGBA.delete();
        channels.delete();
        result.delete();

        resolve(dataUrl);
      } catch (error) {
        console.error('❌ Homography transform error:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load source image'));
    };

    img.src = sourceImageUrl;
  });
}

/**
 * Simple bucket fill: stretch image to fit exact rectangle
 */
export async function bucketFillTransform(
  sourceImageUrl: string,
  destRect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        console.log('🪣 Bucket fill transform...');
        console.log('Source:', { width: img.width, height: img.height });
        console.log('Dest rect:', destRect);

        const canvas = document.createElement('canvas');
        canvas.width = destRect.width;
        canvas.height = destRect.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image stretched to fill exact dimensions
        ctx.drawImage(img, 0, 0, destRect.width, destRect.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        console.log('✅ Bucket fill complete!');
        
        resolve(dataUrl);
      } catch (error) {
        console.error('❌ Bucket fill error:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load source image'));
    };

    img.src = sourceImageUrl;
  });
}
