import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBBox, isBbl, normalizeSearchTerm, parseBBoxParts, parseBoroughBlockLot, searchParcels } from '../src/utils/geo/core.mjs';

const sampleParcels = [
  {
    bbl: '1000477501',
    name: 'Battery Maritime Building',
    address: '10 South Street',
    borough: 'Manhattan',
    block: '47',
    lot: '7501',
    zoningDistrict: 'C6-4',
    landUse: 'Transportation / civic',
    overlays: ['Waterfront Access Plan'],
    projects: ['East River resiliency coordination'],
  },
  {
    bbl: '3011890001',
    name: 'Prospect Heights Mixed-Use Corridor',
    address: '625 Atlantic Avenue',
    borough: 'Brooklyn',
    block: '1189',
    lot: '1',
    zoningDistrict: 'M1-4/R7A',
    landUse: 'Mixed residential & commercial',
    overlays: ['Special Enhanced Commercial District'],
    projects: ['Atlantic Avenue plan study'],
  },
];

test('normalizes and classifies map search inputs', () => {
  assert.equal(normalizeSearchTerm('  Battery   Maritime  '), 'battery maritime');
  assert.equal(isBbl('1000477501'), true);
  assert.equal(isBbl('10047'), false);
});

test('parses borough/block/lot values into canonical BBL values', () => {
  assert.equal(parseBoroughBlockLot('Brooklyn 1189 1'), '3011890001');
  assert.equal(parseBoroughBlockLot('MN/47/7501'), '1000477501');
  assert.equal(parseBoroughBlockLot('not a bbl'), null);
});

test('validates and formats bbox route coordinates', () => {
  const bounds = parseBBoxParts('-73.9978', '40.5705', '-73.9804', '40.5785');
  assert.deepEqual(bounds, { west: -73.9978, south: 40.5705, east: -73.9804, north: 40.5785 });
  assert.equal(formatBBox(bounds), '-73.9978, 40.5705 → -73.9804, 40.5785');
  assert.equal(parseBBoxParts('1', '1', '0', '0'), null);
  assert.equal(parseBBoxParts('-181', '0', '1', '2'), null);
});

test('searches parcels by BBL, BBL-like input, zoning, address, overlays, and projects', () => {
  assert.equal(searchParcels('1000477501', sampleParcels)[0].name, 'Battery Maritime Building');
  assert.equal(searchParcels('Brooklyn 1189 1', sampleParcels)[0].bbl, '3011890001');
  assert.equal(searchParcels('c6-4', sampleParcels)[0].bbl, '1000477501');
  assert.equal(searchParcels('waterfront', sampleParcels)[0].bbl, '1000477501');
  assert.equal(searchParcels('atlantic avenue', sampleParcels)[0].bbl, '3011890001');
});
