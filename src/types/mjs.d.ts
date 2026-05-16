declare module '*.mjs' {
  export const BBL_PATTERN: RegExp;
  export function normalizeSearchTerm(value?: string): string;
  export function isBbl(value?: string): boolean;
  export function parseBoroughBlockLot(value?: string): string | null;
  export function parseBBoxParts(west: unknown, south: unknown, east: unknown, north: unknown): import('../utils/geo/types').Bounds | null;
  export function formatBBox(bounds: import('../utils/geo/types').Bounds | null): string;
  export function searchParcels<T>(query: string, parcels: T[]): T[];
}
