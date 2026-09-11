import { queryServices } from './services.js';
const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...extra } });
async function catalog(request, env) {
  const response = await env.ASSETS.fetch(new Request(new URL('/search-index.json', request.url), { headers: { accept: 'application/json' } }));
  if (!response.ok) throw new Error('search_index_unavailable'); return response.json();
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true, service: 'brasa-government', version: 1 });
    if (url.pathname === '/api/v1/services') {
      if (!['GET','HEAD'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD' });
      try {
        const result = queryServices(await catalog(request, env), url.searchParams);
        if (result.error) return json({ error: result.error }, 400, { 'cache-control': 'no-store' });
        const response = json(result, 200, { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' });
        return request.method === 'HEAD' ? new Response(null, response) : response;
      } catch (error) {
        console.error(JSON.stringify({ event: 'government_service_error', message: error instanceof Error ? error.message : 'unknown' }));
        return json({ error: 'service_unavailable' }, 503, { 'cache-control': 'no-store' });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
