export interface Bounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface MapSource {
  id: string;
  type: 'vector' | 'geojson' | 'raster';
  url?: string;
  tiles?: string[];
  attribution?: string;
}

export interface LegendItem {
  label: string;
  color: string;
}

export interface MapLayer {
  id: string;
  label: string;
  description: string;
  sourceId: string;
  sourceLayer?: string;
  type: 'fill' | 'line' | 'circle' | 'symbol';
  paint: Record<string, unknown>;
  layout?: Record<string, unknown>;
  legend: LegendItem[];
  defaultVisible: boolean;
  attribution?: string;
}

export interface LayerGroup {
  id: string;
  label: string;
  description: string;
  layers: MapLayer[];
}

export interface ParcelFeature {
  id: string;
  bbl: string;
  borough: string;
  block: string;
  lot: string;
  name: string;
  address: string;
  zoningDistrict: string;
  landUse: string;
  far: string;
  overlays: string[];
  projects: string[];
  center: [number, number];
  bounds: Bounds;
  svgPoints: string;
  summary: string;
}

export interface SearchResult {
  id: string;
  type: 'bbl' | 'address' | 'zoning' | 'project';
  label: string;
  description: string;
  bbl?: string;
  center?: [number, number];
  bounds?: Bounds;
}
