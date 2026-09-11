const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function queryServices(records, searchParams) {
  const query = normalize(searchParams.get('q')).trim(), page = normalize(searchParams.get('page')).trim();
  const countryCode = String(searchParams.get('countryCode') || 'CR').toUpperCase(), requestedLimit = Number(searchParams.get('limit') || 20);
  if (query.length > 100 || page.length > 100) return { error: 'invalid_query' };
  if (countryCode !== 'CR') return { error: 'country_not_available' };
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) return { error: 'invalid_limit' };
  const limit = Math.min(requestedLimit, 50);
  const matches = records.filter((record) => (!query || normalize(`${record.label} ${record.page}`).includes(query)) && (!page || normalize(record.page) === page));
  return { data: matches.slice(0, limit).map((record, index) => ({ schemaVersion: 1, id: `cr-${normalize(record.page).replace(/[^a-z0-9]+/g, '-')}-${index + 1}`, countryCode: 'CR', label: String(record.label), category: String(record.page), sourceUrl: String(record.url), sourceStatus: 'unreviewed-existing-index', informationalOnly: true })), meta: { total: matches.length, limit, countryCode: 'CR', query: query || null, category: page || null } };
}
