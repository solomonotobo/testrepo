import { isBbl, parseBoroughBlockLot, searchParcels } from './core.mjs';
import { demoParcels } from './demo-data';
import { fetchParcelByBbl } from './layers-api';
import type { SearchResult } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_GEO_API_BASE_URL;

function parcelToResult(parcel: (typeof demoParcels)[number]): SearchResult {
  return {
    id: parcel.id,
    type: isBbl(parcel.bbl) ? 'bbl' : 'address',
    label: parcel.address,
    description: `${parcel.name} · ${parcel.borough} · ${parcel.zoningDistrict}`,
    bbl: parcel.bbl,
    center: parcel.center,
    bounds: parcel.bounds,
  };
}

export async function lookupBbl(bbl: string) {
  if (!isBbl(bbl)) return null;
  return fetchParcelByBbl(bbl);
}

export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  if (API_BASE_URL) {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Geo search failed: ${response.status} ${response.statusText}`);
    return response.json() as Promise<SearchResult[]>;
  }

  const bbl = isBbl(query) ? query : parseBoroughBlockLot(query);
  const localMatches = bbl ? demoParcels.filter((parcel) => parcel.bbl === bbl) : searchParcels(query, demoParcels);
  return localMatches.map(parcelToResult);
}
