import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import worker from '../src/index.js';
const contract = JSON.parse(await readFile(new URL('../contracts/brasa-public-api.v1.json', import.meta.url)));
const records = [{ label: 'Water service', page: 'Water', url: 'https://www.aya.go.cr' }];

test('government handler satisfies the BRASA v1 public contract', async () => {
  assert.equal(contract.operationId, 'findGovernmentServices'); assert.match(contract.contractVersion, /^1\./);
  const env = { ASSETS: { fetch: async () => Response.json(records) } };
  const response = await worker.fetch(new Request(`https://brasagovernment.net${contract.servicePath}`), env);
  assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /^public/);
  const body = await response.json();
  for (const field of contract.requiredRoot) assert.ok(field in body);
  for (const item of body.data) for (const field of contract.requiredItem) assert.ok(field in item, `missing ${field}`);
  const serialized = JSON.stringify(body);
  for (const field of contract.forbiddenFields) assert.equal(new RegExp(`"${field}"\\s*:`).test(serialized), false, `exposed ${field}`);
});

test('government public contract is read-only', async () => {
  const response = await worker.fetch(new Request(`https://brasagovernment.net${contract.servicePath}`, { method: 'POST' }), {});
  assert.equal(response.status, 405); assert.equal(response.headers.get('allow'), 'GET, HEAD');
});
