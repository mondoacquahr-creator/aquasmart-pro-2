export interface RoomDimensions {
  width: number; // x in cm
  height: number; // y in cm
  depth: number; // z in cm
}

export interface ObjectDimensions {
  width: number; // in cm
  height: number; // in cm
  depth: number; // in cm
}

export interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DesignObject {
  id: string;
  type: 'sauna' | 'jacuzzi' | 'custom';
  name: string;
  imageUrl: string;
  dimensions: ObjectDimensions;
  position: {
    x: number;
    y: number;
  };
  scale: number;
  rotation: number; // in degrees
  scaleX: number; // separate horizontal scaling
  scaleY: number; // separate vertical scaling
  displayWidth?: number; // actual pixel width on canvas (for resize)
  displayHeight?: number; // actual pixel height on canvas (for resize)
  perspectivePoints?: Array<{x: number, y: number}>; // 4 points for perspective transform
  transformedImageUrl?: string; // URL of the transformed image if perspective applied
  zIndex?: number; // layer order
}

export interface ProjectData {
  projectType: 'interior' | 'exterior' | null;
  roomDimensions: RoomDimensions | null;
  roomPhoto: string | null;
  editedPhoto: string | null;
  boundaryLines: Line[];
  objects: DesignObject[];
  spaceCropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
