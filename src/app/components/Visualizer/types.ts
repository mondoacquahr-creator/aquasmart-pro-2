export interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ObjectDimensions {
  width: number;
  height: number;
  depth: number;
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
  type?: 'sauna' | 'jacuzzi' | 'custom';
  name: string;
  imageUrl: string;
  dimensions: ObjectDimensions;
  position: { x: number; y: number };
  scale?: number;
  rotation: number;
  scaleX?: number;
  scaleY?: number;
  displayWidth: number;
  displayHeight: number;
  perspectivePoints?: Array<{x: number, y: number}>;
  transformedImageUrl?: string;
  zIndex?: number;
}

export interface ProjectData {
  projectType: 'interior' | 'exterior' | null;
  roomDimensions: RoomDimensions;
  roomPhoto: string | null;
  editedPhoto: string | null;
  boundaryLines: Line[];
  objects: DesignObject[];
  spaceCropArea?: { x: number; y: number; width: number; height: number };
}