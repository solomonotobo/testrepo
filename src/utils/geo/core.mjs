export const BBL_PATTERN = /^\d{10}$/;

export function normalizeSearchTerm(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isBbl(value = '') {
  return BBL_PATTERN.test(String(value).trim());
}

export function parseBoroughBlockLot(value = '') {
  const normalized = normalizeSearchTerm(value).replace(/[,/]+/g, ' ');
  const match = normalized.match(/^(manhattan|bronx|brooklyn|queens|staten island|mn|bx|bk|qn|si)\s+(\d{1,5})\s+(\d{1,4})$/);
  if (!match) return null;

  const boroughCodes = {
    manhattan: '1',
    mn: '1',
    bronx: '2',
    bx: '2',
    brooklyn: '3',
    bk: '3',
    queens: '4',
    qn: '4',
    'staten island': '5',
    si: '5',
  };

  return `${boroughCodes[match[1]]}${match[2].padStart(5, '0')}${match[3].padStart(4, '0')}`;
}

export function parseBBoxParts(west, south, east, north) {
  const bounds = {
    west: Number(west),
    south: Number(south),
    east: Number(east),
    north: Number(north),
  };

  if (Object.values(bounds).some((value) => !Number.isFinite(value))) return null;
  if (bounds.west >= bounds.east || bounds.south >= bounds.north) return null;
  if (bounds.west < -180 || bounds.east > 180 || bounds.south < -90 || bounds.north > 90) return null;

  return bounds;
}

export function formatBBox(bounds) {
  if (!bounds) return '';
  return `${bounds.west.toFixed(4)}, ${bounds.south.toFixed(4)} → ${bounds.east.toFixed(4)}, ${bounds.north.toFixed(4)}`;
}

export function searchParcels(query, parcels = []) {
  const normalized = normalizeSearchTerm(query);
  const parsedBbl = isBbl(normalized) ? normalized : parseBoroughBlockLot(normalized);
  if (!normalized) return parcels;

  return parcels.filter((parcel) => {
    if (parsedBbl && parcel.bbl === parsedBbl) return true;

    const haystack = [
      parcel.bbl,
      parcel.name,
      parcel.address,
      parcel.borough,
      parcel.block,
      parcel.lot,
      parcel.zoningDistrict,
      parcel.landUse,
      ...(parcel.overlays ?? []),
      ...(parcel.projects ?? []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
