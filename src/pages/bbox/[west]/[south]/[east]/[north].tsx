import dynamic from 'next/dynamic';
import type { GetServerSideProps } from 'next';
import { parseBBoxParts } from '../../../../../utils/geo/core.mjs';
import type { Bounds } from '../../../../../utils/geo/types';

const MapShell = dynamic(() => import('../../../../../components/map/MapShell'), {
  ssr: false,
  loading: () => <main className="map-loading">Loading bounding box route…</main>,
});

interface BBoxPageProps {
  bounds: Bounds;
}

export default function BBoxPage({ bounds }: BBoxPageProps) {
  return <MapShell initialBounds={bounds} />;
}

export const getServerSideProps: GetServerSideProps<BBoxPageProps> = async ({ params }) => {
  const bounds = parseBBoxParts(params?.west, params?.south, params?.east, params?.north);

  if (!bounds) {
    return { notFound: true };
  }

  return { props: { bounds } };
};
