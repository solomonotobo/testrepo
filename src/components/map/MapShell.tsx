import { useEffect, useMemo, useRef, useState } from 'react';
import { formatBBox } from '../../utils/geo/core.mjs';
import { demoParcels } from '../../utils/geo/demo-data';
import { fetchFeaturesByBounds, fetchLayerGroups, fetchParcelByBbl } from '../../utils/geo/layers-api';
import type { Bounds, LayerGroup, ParcelFeature, SearchResult } from '../../utils/geo/types';
import { LayerTogglePanel } from './LayerTogglePanel';
import { MapSearch } from './MapSearch';
import { ParcelDetails } from './ParcelDetails';

interface MapShellProps {
  initialBbl?: string;
  initialBounds?: Bounds | null;
}

export default function MapShell({ initialBbl, initialBounds = null }: MapShellProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([]);
  const [visibleLayerIds, setVisibleLayerIds] = useState<Set<string>>(new Set());
  const [selectedParcel, setSelectedParcel] = useState<ParcelFeature | null>(null);
  const [visibleParcels, setVisibleParcels] = useState<ParcelFeature[]>(demoParcels);
  const [mapStatus, setMapStatus] = useState('Loading map shell…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialData() {
      try {
        const groups = await fetchLayerGroups();
        if (!isCurrent) return;
        setLayerGroups(groups);
        setVisibleLayerIds(new Set(groups.flatMap((group) => group.layers.filter((layer) => layer.defaultVisible).map((layer) => layer.id))));

        if (initialBbl) {
          const parcel = await fetchParcelByBbl(initialBbl);
          if (parcel && isCurrent) setSelectedParcel(parcel);
        }

        if (initialBounds) {
          const features = await fetchFeaturesByBounds(initialBounds);
          if (isCurrent) setVisibleParcels(features.length ? features : demoParcels);
        }
      } catch (loadError) {
        if (isCurrent) setError(loadError instanceof Error ? loadError.message : 'Unable to load geo data.');
      }
    }

    loadInitialData();
    return () => {
      isCurrent = false;
    };
  }, [initialBbl, initialBounds]);

  useEffect(() => {
    let isMounted = true;

    function initializeProvider() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      import('maplibre-gl')
        .then((maplibre) => {
          if (!isMounted || !mapContainerRef.current) return;

          mapInstanceRef.current = new maplibre.Map({
            container: mapContainerRef.current,
            style: 'https://demotiles.maplibre.org/style.json',
            center: selectedParcel?.center ?? [-73.97, 40.72],
            zoom: selectedParcel ? 14 : 10,
          });
          setMapStatus('Interactive MapLibre base map loaded.');
        })
        .catch(() => {
          if (isMounted) setMapStatus('MapLibre provider unavailable; showing local SVG fallback.');
        });
    }

    initializeProvider();
    return () => {
      isMounted = false;
      const map = mapInstanceRef.current as { remove?: () => void } | null;
      map?.remove?.();
      mapInstanceRef.current = null;
    };
  }, [selectedParcel]);

  const routeLabel = useMemo(() => {
    if (initialBbl) return `/bbl/${initialBbl}`;
    if (initialBounds) return `/bbox/${formatBBox(initialBounds)}`;
    return '/map';
  }, [initialBbl, initialBounds]);

  function toggleLayer(layerId: string) {
    setVisibleLayerIds((current) => {
      const next = new Set(current);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }

  async function handleSearchSelect(result: SearchResult) {
    if (!result.bbl) return;
    const parcel = await fetchParcelByBbl(result.bbl);
    setSelectedParcel(parcel);
  }

  return (
    <main className="zola-map-shell">
      <aside className="map-sidebar">
        <div className="brand-block">
          <p className="eyebrow">ZoLa-inspired MVP</p>
          <h1>Zoning and Land Use Map</h1>
          <p>Search parcels, toggle editable layer metadata, and deep-link into BBL or bounding-box views.</p>
        </div>
        <MapSearch onSelect={handleSearchSelect} />
        <LayerTogglePanel groups={layerGroups} visibleLayerIds={visibleLayerIds} onToggle={toggleLayer} />
      </aside>

      <section className="map-workspace" aria-label="Interactive zoning map workspace">
        <div className="map-toolbar">
          <div>
            <p className="eyebrow">Route</p>
            <strong>{routeLabel}</strong>
          </div>
          <span>{mapStatus}</span>
        </div>
        {error ? <div className="map-error">{error}</div> : null}
        <div className="provider-map" ref={mapContainerRef} aria-label="MapLibre base map container" />
        <svg className="fallback-map" viewBox="0 0 960 720" role="img" aria-label="Fallback parcel and zoning map">
          <rect width="960" height="720" fill="#dff7ff" />
          <path className="borough-shape" d="M330 60 C500 42 620 145 596 292 C582 380 520 438 422 465 C335 488 245 455 220 365 C184 232 210 88 330 60Z" />
          <path className="borough-shape" d="M545 300 C710 250 878 320 875 480 C872 632 706 690 560 628 C458 586 432 392 545 300Z" />
          {visibleParcels.map((parcel) => (
            <g key={parcel.id}>
              <polygon
                className={parcel.bbl === selectedParcel?.bbl ? 'parcel selected' : 'parcel'}
                onClick={() => setSelectedParcel(parcel)}
                points={parcel.svgPoints}
              />
              <text className="parcel-label" x={parcel.svgPoints.split(' ')[0].split(',')[0]} y={Number(parcel.svgPoints.split(' ')[0].split(',')[1]) - 10}>
                {parcel.zoningDistrict}
              </text>
            </g>
          ))}
        </svg>
      </section>

      <aside className="details-sidebar">
        <ParcelDetails parcel={selectedParcel} />
      </aside>
    </main>
  );
}
