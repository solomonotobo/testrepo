import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="content-page">
      <p className="eyebrow">Content starter</p>
      <h1>Netlify Next content site with a ZoLa-inspired map MVP</h1>
      <p>This starter keeps normal content pages while adding explicit GIS routes for zoning and parcel research.</p>
      <Link className="primary-link" href="/map">Open the zoning map</Link>
    </main>
  );
}
