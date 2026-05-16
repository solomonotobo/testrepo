import dynamic from 'next/dynamic';

const MapShell = dynamic(() => import('../components/map/MapShell'), {
  ssr: false,
  loading: () => <main className="map-loading">Loading zoning map…</main>,
});

export default function MapPage() {
  return <MapShell />;
}
