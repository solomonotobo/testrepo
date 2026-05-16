# Metro Zoning & Land Use Atlas

A lightweight, ZoLa-inspired zoning and land-use map prototype. The app provides a parcel search experience, layer toggles, a stylized city map, lot-level details, and route helpers for BBL and bounding-box URLs.

## Features

- Search by address, BBL, borough, zoning district, overlay, or planning project.
- Toggle zoning, land-use, and planning-project layers.
- Select parcels from the map or results list to inspect BBL, zoning, FAR, overlays, and planning activity.
- Open `/bbl/:bbl` routes to preselect known parcels.
- Open `/bbox/:west/:south/:east/:north` routes to display a route bounding-box chip.

## Development

```bash
npm test
npm run build
npm start
```

The app uses native browser modules and a small Node.js static server, so it does not require installing third-party runtime dependencies.
