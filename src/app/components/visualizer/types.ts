// Basic types for Pool Visualizer
export interface ProjectData {
  projectType?: string;
  roomPhoto: string | null;
  roomPhotoDimensions?: { width: number; height: number }; // ⚡ ADD THIS!
  editedPhoto?: string | null;
  roomDimensions?: { width: number; height: number; depth: number };
  boundaryLines?: any[];
  objects: DesignObject[];
  spaceCropArea?: { x: number; y: number; width: number; height: number };
  spaceCropCanvasSize?: { width: number; height: number };
  spaceCropPolygonPoints?: Array<{x: number, y: number}>;
}

export interface DesignObject {
  id: string;
  name: string;
  imageUrl: string;
  position: { x: number; y: number };
  rotation: number;
  dimensions: { width: number; height: number; depth: number };
  displayWidth: number;
  displayHeight: number;
}