import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBBox, getParcelByBbl, normalizeSearchTerm, parseBBoxRoute, parseBblRoute, searchParcels } from '../src/app.js';

const sampleParcels = [
  {
    bbl: '1000000001',
    borough: 'Manhattan',
    block: '1',
    lot: '1',
    name: 'Example Civic Lot',
    address: '1 Test Plaza',
    zoning: 'C6-4',
    landUse: 'Civic',
    overlays: ['Waterfront Access Plan'],
    projects: ['Resiliency study'],
  },
  {
    bbl: '3000000002',
    borough: 'Brooklyn',
    block: '2',
    lot: '2',
    name: 'Neighborhood Housing',
    address: '2 Sample Avenue',
    zoning: 'R7A',
    landUse: 'Residential',
    overlays: [],
    projects: [],
  },
];

test('normalizes user search terms', () => {
  assert.equal(normalizeSearchTerm('  Battery   Maritime  '), 'battery maritime');
});

test('searches parcels across address, zoning, overlays, and projects', () => {
  assert.equal(searchParcels('c6-4', sampleParcels).length, 1);
  assert.equal(searchParcels('waterfront', sampleParcels)[0].bbl, '1000000001');
  assert.equal(searchParcels('sample avenue', sampleParcels)[0].bbl, '3000000002');
});

test('parses supported route patterns', () => {
  assert.equal(parseBblRoute('/bbl/1000477501'), '1000477501');
  assert.equal(parseBblRoute('/bbl/not-a-bbl'), null);
  assert.deepEqual(parseBBoxRoute('/bbox/-73.9978/40.5705/-73.9804/40.5785'), {
    west: -73.9978,
    south: 40.5705,
    east: -73.9804,
    north: 40.5785,
  });
  assert.equal(parseBBoxRoute('/bbox/1/1/0/0'), null);
});

test('gets parcel records by BBL and formats route bounds', () => {
  assert.equal(getParcelByBbl('3000000002', sampleParcels).name, 'Neighborhood Housing');
  assert.equal(getParcelByBbl('9999999999', sampleParcels), null);
  assert.equal(formatBBox({ west: -73.99781, south: 40.57051, east: -73.98041, north: 40.57851 }), '-73.9978, 40.5705 → -73.9804, 40.5785');
});
