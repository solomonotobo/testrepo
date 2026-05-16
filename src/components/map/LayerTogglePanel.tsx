import type { LayerGroup } from '../../utils/geo/types';

interface LayerTogglePanelProps {
  groups: LayerGroup[];
  visibleLayerIds: Set<string>;
  onToggle: (layerId: string) => void;
}

export function LayerTogglePanel({ groups, visibleLayerIds, onToggle }: LayerTogglePanelProps) {
  return (
    <section className="map-card layer-panel" aria-labelledby="map-layers-heading">
      <div className="section-heading">
        <h2 id="map-layers-heading">Map layers</h2>
        <span>{visibleLayerIds.size} active</span>
      </div>
      {groups.map((group) => (
        <div className="layer-group" key={group.id}>
          <h3>{group.label}</h3>
          <p>{group.description}</p>
          <div className="layer-list">
            {group.layers.map((layer) => (
              <label className="layer-toggle" key={layer.id}>
                <input type="checkbox" checked={visibleLayerIds.has(layer.id)} onChange={() => onToggle(layer.id)} />
                <span>
                  <strong>{layer.label}</strong>
                  <small>{layer.description}</small>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
