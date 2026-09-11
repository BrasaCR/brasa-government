import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.js';
import { queryServices } from '../src/services.js';
const records = [{ label: 'AyA water service', page: 'Water & sewerage', url: 'https://www.aya.go.cr' }, { label: 'Public schools', page: 'Education', url: 'https://www.mep.go.cr' }];
test('searches anonymous sourced civic records', () => {
  const result = queryServices(records, new URLSearchParams('q=water&countryCode=CR'));
  assert.equal(result.data.length, 1); assert.equal(result.data[0].sourceStatus, 'unreviewed-existing-index'); assert.equal(result.data[0].informationalOnly, true);
  for (const field of ['govId','political','eligibility','citizenId','activity']) assert.equal(JSON.stringify(result).includes(field), false);
});
test('fails closed outside reviewed country coverage', () => {
  assert.equal(queryServices(records, new URLSearchParams('countryCode=US')).error, 'country_not_available'); assert.equal(queryServices(records, new URLSearchParams('limit=none')).error, 'invalid_limit');
});
test('serves the API from the fixed internal asset', async () => {
  let assetPath; const env = { ASSETS: { fetch: async (request) => { assetPath = new URL(request.url).pathname; return new Response(JSON.stringify(records)); } } };
  const response = await worker.fetch(new Request('https://brasagovernment.net/api/v1/services?q=school'), env);
  assert.equal(response.status, 200); assert.equal(assetPath, '/search-index.json'); assert.equal((await response.json()).data.length, 1);
});
