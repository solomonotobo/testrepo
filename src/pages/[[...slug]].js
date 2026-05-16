export default function ContentPage({ slug }) {
  const path = slug?.length ? `/${slug.join('/')}` : '/';
  return (
    <main className="content-page">
      <p className="eyebrow">Static content route</p>
      <h1>Content page placeholder</h1>
      <p>This catch-all route represents the content-driven starter surface and intentionally does not capture explicit map routes.</p>
      <p>Requested path: {path}</p>
    </main>
  );
}

export function getStaticProps({ params }) {
  return { props: { slug: params?.slug ?? null } };
}

export function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}
