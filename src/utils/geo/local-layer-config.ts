import zoningDistricts from '../../../content/data/map-layers/zoning-districts.json';
import landUse from '../../../content/data/map-layers/land-use.json';
import planningProjects from '../../../content/data/map-layers/planning-projects.json';
import type { LayerGroup, MapLayer } from './types';

const localLayers = [zoningDistricts, landUse, planningProjects] as MapLayer[];

export function getLocalLayerGroups(): LayerGroup[] {
  return [
    {
      id: 'zoning-and-land-use',
      label: 'Zoning and land use',
      description: 'Editable presentation metadata for zoning, land-use, and planning overlays.',
      layers: localLayers,
    },
  ];
}
