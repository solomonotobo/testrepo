import dynamic from 'next/dynamic';
import type { GetServerSideProps } from 'next';
import { isBbl } from '../../utils/geo/core.mjs';

const MapShell = dynamic(() => import('../../components/map/MapShell'), {
  ssr: false,
  loading: () => <main className="map-loading">Loading parcel route…</main>,
});

interface BblPageProps {
  bbl: string;
}

export default function BblPage({ bbl }: BblPageProps) {
  return <MapShell initialBbl={bbl} />;
}

export const getServerSideProps: GetServerSideProps<BblPageProps> = async ({ params }) => {
  const bbl = String(params?.bbl ?? '');

  if (!isBbl(bbl)) {
    return { notFound: true };
  }

  return { props: { bbl } };
};
