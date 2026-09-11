import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import worker from '../src/index.js';
import { queryServices } from '../src/services.js';
const records = [{ label: 'AyA water service', page: 'Water & sewerage', url: 'https://www.aya.go.cr' }, { label: 'Public schools', page: 'Education', url: 'https://www.mep.go.cr' }];
test('searches anonymous sourced civic records', () => {
  const result = queryServices(records, new URLSearchParams('q=water&countryCode=CR'));
  assert.equal(result.data.length, 1); assert.equal(result.data[0].sourceStatus, 'unreviewed-existing-index'); assert.equal(result.data[0].informationalOnly, true);
  for (const field of ['govId','political','eligibility','citizenId','activity']) assert.equal(JSON.stringify(result).includes(field), false);
});
test('service identifiers remain stable across filters and result positions', () => {
  const all=queryServices(records,new URLSearchParams('countryCode=CR')).data;
  const filtered=queryServices(records,new URLSearchParams('q=schools&countryCode=CR')).data;
  assert.equal(filtered[0].id,all[1].id);assert.match(filtered[0].id,/^cr-[a-z0-9-]+$/);
});
test('fails closed outside reviewed country coverage', () => {
  assert.equal(queryServices(records, new URLSearchParams('countryCode=US')).error, 'country_not_available'); assert.equal(queryServices(records, new URLSearchParams('limit=none')).error, 'invalid_limit');
});
test('serves the API from the fixed internal asset', async () => {
  let assetPath; const env = { ASSETS: { fetch: async (request) => { assetPath = new URL(request.url).pathname; return new Response(JSON.stringify(records)); } } };
  const response = await worker.fetch(new Request('https://brasagovernment.net/api/v1/services?q=school'), env);
  assert.equal(response.status, 200); assert.equal(assetPath, '/search-index.json'); assert.equal((await response.json()).data.length, 1);
});
test('restricted asset build excludes dependency and deployment metadata', async () => {
  await assert.doesNotReject(access(new URL('../.gov-assets/search-index.json', import.meta.url)));
  await assert.rejects(access(new URL('../.gov-assets/package-lock.json', import.meta.url)));
  await assert.rejects(access(new URL('../.gov-assets/wrangler.jsonc', import.meta.url)));
});
