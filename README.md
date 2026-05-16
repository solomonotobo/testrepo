# Netlify Next ZoLa Map Starter

This repository now includes a first-pass, ZoLa-inspired zoning map surface for a Next.js content starter. It is intentionally structured as an MVP shell rather than a full NYCPlanning ZoLa clone: live parcel geometry, authoritative zoning tiles, and production search APIs can be wired through environment variables as those services become available.

## MVP included

- `/map` renders a client-only GIS application shell.
- `/bbl/:bbl` validates and deep-links to a selected parcel.
- `/bbox/:west/:south/:east/:north` validates and deep-links to a map extent.
- Layer metadata is loaded from editable local content under `content/data/map-layers/`.
- Geo service modules expose layer, parcel, bounds, and search functions that can use `NEXT_PUBLIC_GEO_API_BASE_URL` when a backend is configured, with local demo data as a fallback.
- Parcel/address/BBL search supports BBL-like values, free-text addresses, zoning labels, borough names, and planning project names.

## Environment

Optional live API base URL:

```bash
NEXT_PUBLIC_GEO_API_BASE_URL=https://example.com/geo-api
```

Expected backend endpoints if configured:

- `GET /layers`
- `GET /parcels/:bbl`
- `GET /features?west=&south=&east=&north=`
- `GET /search?q=`

## Development

```bash
npm install
npm run dev
npm test
npm run build
```

The map component dynamically imports MapLibre GL JS in the browser to avoid SSR issues. If the provider package or CSS is unavailable, the shell still renders a local SVG fallback so routing, search, layer toggles, and details remain usable during early integration.
