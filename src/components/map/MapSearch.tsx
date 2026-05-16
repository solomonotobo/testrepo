import { useEffect, useState } from 'react';
import { isBbl, parseBoroughBlockLot } from '../../utils/geo/core.mjs';
import { searchLocations } from '../../utils/geo/search-api';
import type { SearchResult } from '../../utils/geo/types';

interface MapSearchProps {
  onSelect: (result: SearchResult) => void;
}

export function MapSearch({ onSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const handle = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      try {
        const nextResults = await searchLocations(query);
        if (isCurrent) {
          setResults(nextResults);
          setError(nextResults.length ? null : 'No matching address, BBL, zoning district, or planning project was found.');
        }
      } catch (searchError) {
        if (isCurrent) setError(searchError instanceof Error ? searchError.message : 'Search failed.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, 180);

    return () => {
      isCurrent = false;
      window.clearTimeout(handle);
    };
  }, [query]);

  const parsedBbl = isBbl(query) ? query : parseBoroughBlockLot(query);

  return (
    <section className="map-card search-panel" aria-labelledby="map-search-heading">
      <h2 id="map-search-heading">Find address, BBL, parcel, or zoning</h2>
      <input
        aria-describedby="search-help"
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try 1000477501, C6-4, or Brooklyn 1189 1"
        type="search"
        value={query}
      />
      <p id="search-help">BBL-like values and borough/block/lot formats are detected automatically.</p>
      {parsedBbl ? <p className="route-hint">Detected BBL: {parsedBbl}</p> : null}
      {isLoading ? <p className="route-hint">Searching…</p> : null}
      {error ? <p className="search-error">{error}</p> : null}
      {results.length ? (
        <ul className="search-results">
          {results.map((result) => (
            <li key={result.id}>
              <button type="button" onClick={() => onSelect(result)}>
                <strong>{result.label}</strong>
                <small>{result.description}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
