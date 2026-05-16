import type { ParcelFeature } from '../../utils/geo/types';

interface ParcelDetailsProps {
  parcel: ParcelFeature | null;
}

export function ParcelDetails({ parcel }: ParcelDetailsProps) {
  if (!parcel) {
    return (
      <section className="map-card details-panel">
        <h2>No parcel selected</h2>
        <p>Use search, a BBL route, or the map to select a parcel and inspect zoning details.</p>
      </section>
    );
  }

  return (
    <section className="map-card details-panel" aria-live="polite">
      <p className="eyebrow">Selected parcel</p>
      <h2>{parcel.name}</h2>
      <p>{parcel.summary}</p>
      <dl className="detail-grid">
        <div><dt>Address</dt><dd>{parcel.address}</dd></div>
        <div><dt>BBL</dt><dd>{parcel.bbl}</dd></div>
        <div><dt>Borough</dt><dd>{parcel.borough}</dd></div>
        <div><dt>Block / lot</dt><dd>{parcel.block} / {parcel.lot}</dd></div>
        <div><dt>Zoning</dt><dd>{parcel.zoningDistrict}</dd></div>
        <div><dt>Land use</dt><dd>{parcel.landUse}</dd></div>
        <div><dt>FAR</dt><dd>{parcel.far}</dd></div>
      </dl>
      <h3>Overlays</h3>
      <ul>{parcel.overlays.map((overlay) => <li key={overlay}>{overlay}</li>)}</ul>
      <h3>Planning activity</h3>
      <ul>{parcel.projects.map((project) => <li key={project}>{project}</li>)}</ul>
    </section>
  );
}
