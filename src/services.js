const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const slug = (value, length) => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, length);
const fingerprint = (value) => { let hash = 2166136261; for (const character of value) { hash ^= character.codePointAt(0); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36).padStart(7, '0'); };
export const serviceId = (record) => `cr-${slug(record.page, 30)}-${slug(record.label, 42)}-${fingerprint(`${record.page}\n${record.label}`)}`;
export const publicService = (record) => ({ schemaVersion: 1, id: serviceId(record), countryCode: 'CR', label: String(record.label), category: String(record.page), sourceUrl: String(record.url), sourceStatus: 'unreviewed-existing-index', informationalOnly: true });
export function queryServices(records, searchParams) {
  const query = normalize(searchParams.get('q')).trim(), page = normalize(searchParams.get('page')).trim();
  const countryCode = String(searchParams.get('countryCode') || 'CR').toUpperCase(), requestedLimit = Number(searchParams.get('limit') || 20);
  if (query.length > 100 || page.length > 100) return { error: 'invalid_query' };
  if (countryCode !== 'CR') return { error: 'country_not_available' };
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) return { error: 'invalid_limit' };
  const limit = Math.min(requestedLimit, 50);
  const matches = records.filter((record) => (!query || normalize(`${record.label} ${record.page}`).includes(query)) && (!page || normalize(record.page) === page));
  return { data: matches.slice(0, limit).map(publicService), meta: { total: matches.length, limit, countryCode: 'CR', query: query || null, category: page || null } };
}
