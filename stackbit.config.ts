const stackbitConfig = {
  stackbitVersion: '~0.6.0',
  nodeVersion: '20',
  contentSources: [],
  models: {
    MapLayer: {
      type: 'data',
      label: 'Map Layer',
      filePath: 'content/data/map-layers/{slug}.json',
      fields: [
        { type: 'string', name: 'id', required: true },
        { type: 'string', name: 'label', required: true },
        { type: 'text', name: 'description' },
        { type: 'string', name: 'sourceId' },
        { type: 'string', name: 'sourceLayer' },
        { type: 'enum', name: 'type', options: ['fill', 'line', 'circle', 'symbol'] },
        { type: 'json', name: 'paint' },
        { type: 'json', name: 'layout' },
        { type: 'list', name: 'legend', items: { type: 'model', models: ['LegendItem'] } },
        { type: 'boolean', name: 'defaultVisible' },
        { type: 'string', name: 'attribution' }
      ]
    },
    LegendItem: {
      type: 'object',
      fields: [
        { type: 'string', name: 'label', required: true },
        { type: 'string', name: 'color', required: true }
      ]
    }
  }
};

export default stackbitConfig;
