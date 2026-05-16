import { layerDefinitions, parcels, planningProjects } from './data.js';

const defaultVisibleLayers = ['zoning', 'landUse', 'projects'];

export function normalizeSearchTerm(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function searchParcels(query, collection = parcels) {
  const term = normalizeSearchTerm(query);
  if (!term) return collection;

  return collection.filter((parcel) => {
    const haystack = [
      parcel.bbl,
      parcel.borough,
      parcel.block,
      parcel.lot,
      parcel.name,
      parcel.address,
      parcel.zoning,
      parcel.landUse,
      ...parcel.overlays,
      ...parcel.projects,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function parseBblRoute(pathname) {
  const match = pathname.match(/^\/bbl\/(\d{10})\/?$/);
  return match ? match[1] : null;
}

export function parseBBoxRoute(pathname) {
  const match = pathname.match(/^\/bbox\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)\/?$/);
  if (!match) return null;

  const [west, south, east, north] = match.slice(1).map(Number);
  if (west >= east || south >= north) return null;

  return { west, south, east, north };
}

export function getParcelByBbl(bbl, collection = parcels) {
  return collection.find((parcel) => parcel.bbl === bbl) ?? null;
}

export function formatBBox(bounds) {
  if (!bounds) return '';
  return `${bounds.west.toFixed(4)}, ${bounds.south.toFixed(4)} → ${bounds.east.toFixed(4)}, ${bounds.north.toFixed(4)}`;
}

function html(strings, ...values) {
  return strings.reduce((result, string, index) => `${result}${string}${values[index] ?? ''}`, '');
}

function layerFill(parcel, visibleLayers) {
  if (visibleLayers.has('zoning')) return parcel.zoning.startsWith('M') ? '#b7c5ff' : parcel.zoning.startsWith('C') ? '#ffd7a8' : '#b7e4c7';
  if (visibleLayers.has('landUse')) return parcel.landUse.includes('Mixed') ? '#99f6e4' : parcel.landUse.includes('industrial') ? '#fecaca' : '#d9f99d';
  return '#d9dee8';
}

function buildState() {
  const bbl = parseBblRoute(window.location.pathname);
  const bbox = parseBBoxRoute(window.location.pathname);
  return {
    query: '',
    selectedParcel: getParcelByBbl(bbl) ?? parcels[0],
    visibleLayers: new Set(defaultVisibleLayers),
    bbox,
  };
}

export function mountApp(root) {
  const state = buildState();

  function selectParcel(parcel, pushRoute = true) {
    state.selectedParcel = parcel;
    if (pushRoute) {
      window.history.pushState({}, '', `/lot/${parcel.borough.toLowerCase()}/${parcel.block}/${parcel.lot}`);
    }
    render();
  }

  function toggleLayer(layerId) {
    if (state.visibleLayers.has(layerId)) {
      state.visibleLayers.delete(layerId);
    } else {
      state.visibleLayers.add(layerId);
    }
    render();
  }

  function renderLayerControls() {
    return layerDefinitions
      .map((layer) => html`
        <label class="layer-card ${state.visibleLayers.has(layer.id) ? 'is-active' : ''}">
          <input type="checkbox" data-layer-toggle="${layer.id}" ${state.visibleLayers.has(layer.id) ? 'checked' : ''} />
          <span class="layer-swatch" style="--layer-color: ${layer.color}"></span>
          <span>
            <strong>${layer.label}</strong>
            <small>${layer.description}</small>
          </span>
        </label>
      `)
      .join('');
  }

  function renderParcelList(results) {
    return results
      .map((parcel) => html`
        <button class="result-card ${parcel.id === state.selectedParcel.id ? 'is-selected' : ''}" data-parcel-id="${parcel.id}">
          <span>${parcel.name}</span>
          <small>${parcel.address} · ${parcel.borough} · ${parcel.zoning}</small>
        </button>
      `)
      .join('');
  }

  function renderMap(results) {
    const resultIds = new Set(results.map((parcel) => parcel.id));
    const parcelShapes = parcels
      .map((parcel) => html`
        <polygon
          class="parcel ${parcel.id === state.selectedParcel.id ? 'is-selected' : ''} ${resultIds.has(parcel.id) ? '' : 'is-muted'}"
          points="${parcel.points}"
          style="--parcel-fill: ${layerFill(parcel, state.visibleLayers)}"
          data-parcel-id="${parcel.id}"
        ></polygon>
        <text class="parcel-label" x="${parcel.centroid[0]}" y="${parcel.centroid[1]}">${parcel.zoning}</text>
      `)
      .join('');

    const projectMarkers = state.visibleLayers.has('projects')
      ? planningProjects
          .map((project) => html`
            <g class="project-marker" tabindex="0" aria-label="${project.name}: ${project.status}">
              <circle cx="${project.x}" cy="${project.y}" r="13"></circle>
              <text x="${project.x}" y="${project.y + 4}">★</text>
            </g>
          `)
          .join('')
      : '';

    return html`
      <svg class="atlas-map" viewBox="0 0 960 760" role="img" aria-label="Interactive stylized zoning and land-use map">
        <defs>
          <linearGradient id="water" x1="0" x2="1">
            <stop offset="0" stop-color="#dff7ff" />
            <stop offset="1" stop-color="#bfe9ff" />
          </linearGradient>
        </defs>
        <rect width="960" height="760" fill="url(#water)"></rect>
        <path class="borough-shape" d="M335 65 C505 42 615 150 596 295 C585 378 522 440 426 467 C338 492 245 456 220 366 C184 235 210 91 335 65Z"></path>
        <path class="borough-shape" d="M545 312 C708 250 875 323 873 482 C870 645 704 706 560 642 C458 596 430 393 545 312Z"></path>
        <path class="borough-shape" d="M73 555 C186 494 342 512 374 626 C402 727 235 762 120 724 C36 696 10 599 73 555Z"></path>
        <path class="arterial" d="M238 382 C382 350 546 320 818 287"></path>
        <path class="arterial" d="M162 665 C332 604 525 534 795 456"></path>
        ${parcelShapes}
        ${projectMarkers}
      </svg>
    `;
  }

  function renderDetails() {
    const parcel = state.selectedParcel;
    return html`
      <section class="details-card" aria-live="polite">
        <p class="eyebrow">Selected lot</p>
        <h2>${parcel.name}</h2>
        <p>${parcel.summary}</p>
        <dl class="detail-grid">
          <div><dt>Address</dt><dd>${parcel.address}</dd></div>
          <div><dt>BBL</dt><dd>${parcel.bbl}</dd></div>
          <div><dt>Borough</dt><dd>${parcel.borough}</dd></div>
          <div><dt>Block / lot</dt><dd>${parcel.block} / ${parcel.lot}</dd></div>
          <div><dt>Zoning</dt><dd>${parcel.zoning}</dd></div>
          <div><dt>Land use</dt><dd>${parcel.landUse}</dd></div>
          <div><dt>Max FAR</dt><dd>${parcel.far}</dd></div>
        </dl>
        <h3>Applicable overlays</h3>
        <ul>${parcel.overlays.map((overlay) => `<li>${overlay}</li>`).join('')}</ul>
        <h3>Planning activity</h3>
        <ul>${parcel.projects.map((project) => `<li>${project}</li>`).join('')}</ul>
      </section>
    `;
  }

  function render() {
    const results = searchParcels(state.query);
    root.innerHTML = html`
      <main class="app-shell">
        <aside class="sidebar">
          <div class="brand-block">
            <p class="eyebrow">Planning Labs prototype</p>
            <h1>Metro Zoning & Land Use Atlas</h1>
            <p>Search a parcel, toggle planning layers, and inspect lot-level zoning intelligence in a ZoLa-inspired interface.</p>
          </div>
          <form class="search-panel" role="search">
            <label for="parcel-search">Find address, BBL, zoning, or project</label>
            <input id="parcel-search" name="q" type="search" value="${state.query}" placeholder="Try C6-4, Battery, or 1000477501" autocomplete="off" />
          </form>
          <section>
            <div class="section-heading">
              <h2>Map layers</h2>
              <span>${state.visibleLayers.size} active</span>
            </div>
            <div class="layer-list">${renderLayerControls()}</div>
          </section>
          <section>
            <div class="section-heading">
              <h2>Search results</h2>
              <span>${results.length} parcels</span>
            </div>
            <div class="result-list">${renderParcelList(results)}</div>
          </section>
        </aside>
        <section class="map-workspace">
          <div class="map-toolbar">
            <div>
              <p class="eyebrow">Citywide map</p>
              <strong>${state.selectedParcel.address}</strong>
            </div>
            <div class="route-chip">${state.bbox ? `BBox ${formatBBox(state.bbox)}` : 'Supports /bbl/:bbl and /bbox/:west/:south/:east/:north routes'}</div>
          </div>
          <div class="map-frame">${renderMap(results)}</div>
        </section>
        <aside class="details-panel">${renderDetails()}</aside>
      </main>
    `;

    root.querySelector('#parcel-search').focus({ preventScroll: true });
    root.querySelector('#parcel-search').setSelectionRange(state.query.length, state.query.length);
  }

  root.addEventListener('input', (event) => {
    if (event.target.matches('#parcel-search')) {
      state.query = event.target.value;
      render();
    }
  });

  root.addEventListener('change', (event) => {
    const layerId = event.target.dataset.layerToggle;
    if (layerId) toggleLayer(layerId);
  });

  root.addEventListener('click', (event) => {
    const parcelTarget = event.target.closest('[data-parcel-id]');
    if (!parcelTarget) return;
    const parcel = parcels.find((item) => item.id === parcelTarget.dataset.parcelId);
    if (parcel) selectParcel(parcel);
  });

  window.addEventListener('popstate', () => {
    const bbl = parseBblRoute(window.location.pathname);
    state.selectedParcel = getParcelByBbl(bbl) ?? state.selectedParcel;
    state.bbox = parseBBoxRoute(window.location.pathname);
    render();
  });

  render();
}
