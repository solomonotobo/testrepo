import dynamic from 'next/dynamic';

export const componentsRegistry = {
  MapShell: dynamic(() => import('./map/MapShell'), { ssr: false }),
};
