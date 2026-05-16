import { demoParcels, intersectsBounds } from './demo-data';
import { getLocalLayerGroups } from './local-layer-config';
import type { Bounds, LayerGroup, ParcelFeature } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_GEO_API_BASE_URL;

async function fetchJson<T>(path: string): Promise<T | null> {
  if (!API_BASE_URL) return null;

  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Geo API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchLayerGroups(): Promise<LayerGroup[]> {
  return (await fetchJson<LayerGroup[]>('/layers')) ?? getLocalLayerGroups();
}

export async function fetchParcelByBbl(bbl: string): Promise<ParcelFeature | null> {
  return (await fetchJson<ParcelFeature>(`/parcels/${encodeURIComponent(bbl)}`)) ?? demoParcels.find((parcel) => parcel.bbl === bbl) ?? null;
}

export async function fetchFeaturesByBounds(bounds: Bounds): Promise<ParcelFeature[]> {
  const params = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
  });

  return (await fetchJson<ParcelFeature[]>(`/features?${params}`)) ?? demoParcels.filter((parcel) => intersectsBounds(parcel.bounds, bounds));
}
