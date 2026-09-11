import { queryServices } from './services.js';
import { serviceNavigator } from './experiences.js';
import { applyReviews, authenticateReviewer, listReviews, reviewSource } from './reviews.js';
const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...extra } });
async function catalog(request, env) {
  const response = await env.ASSETS.fetch(new Request(new URL('/search-index.json', request.url), { headers: { accept: 'application/json' } }));
  if (!response.ok) throw new Error('search_index_unavailable'); return response.json();
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ ok: true, service: 'brasa-government', version: 1 });
    if (url.pathname === '/operator/reviews') {
      const asset=await env.ASSETS.fetch(new Request(new URL('/operator-reviews.html',request.url),request)),response=new Response(asset.body,asset);response.headers.set('cache-control','no-store');response.headers.set('x-content-type-options','nosniff');response.headers.set('referrer-policy','no-referrer');response.headers.set('content-security-policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");return response;
    }
    if (url.pathname.startsWith('/api/operator/v1/')) {
      if (!env.REVIEWS_DB) return json({ error: 'review_registry_unavailable' }, 503, { 'cache-control': 'no-store' });
      if (url.pathname === '/api/operator/v1/session/exchange') {
        if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { allow: 'POST' });
        if (!env.IDENTITY) return json({ error: 'identity_service_unavailable' }, 503, { 'cache-control': 'no-store' });
        return env.IDENTITY.fetch(new Request('https://brasa-identity/api/government/operator/exchange',{method:'POST',headers:{'content-type':'application/json','cf-access-jwt-assertion':request.headers.get('cf-access-jwt-assertion')||''},body:request.body,duplex:'half'}));
      }
      if (url.pathname === '/api/operator/v1/session/logout') {
        if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { allow: 'POST' });
        return env.IDENTITY.fetch(new Request('https://brasa-identity/api/government/operator/logout',{method:'POST',headers:{authorization:request.headers.get('authorization')||''}}));
      }
      const access=await authenticateReviewer(request,env);if(access.response)return access.response;
      if (url.pathname === '/api/operator/v1/session/me' && request.method === 'GET') return json({ data: access.reviewer }, 200, { 'cache-control': 'no-store' });
      if (url.pathname === '/api/operator/v1/reviews' && request.method === 'GET') return listReviews(request,env);
      const review=url.pathname.match(/^\/api\/operator\/v1\/services\/([^/]+)\/review$/);
      if (review && request.method === 'POST') { let id;try{id=decodeURIComponent(review[1])}catch{return json({error:'invalid_service_id'},400,{'cache-control':'no-store'})}return reviewSource(request,env,id,await catalog(request,env),access.reviewer); }
      if (review) return json({ error: 'method_not_allowed' }, 405, { allow: 'POST' });
      return json({ error: 'operator_route_not_found' }, 404, { 'cache-control': 'no-store' });
    }
    if (url.pathname === '/api/v1/experiences/service-navigator') {
      if (!['GET','HEAD'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD' });
      try {
        const result = serviceNavigator(await catalog(request, env), url.searchParams);
        if (result.error) return json({ error: result.error }, result.status, { 'cache-control': 'no-store' });
        result.data.services = await applyReviews(result.data.services, env);
        const response = json(result, 200, { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
        return request.method === 'HEAD' ? new Response(null, response) : response;
      } catch (error) {
        console.error(JSON.stringify({ event: 'government_experience_error', message: error instanceof Error ? error.message : 'unknown' }));
        return json({ error: 'service_unavailable' }, 503, { 'cache-control': 'no-store' });
      }
    }
    if (url.pathname === '/api/v1/services') {
      if (!['GET','HEAD'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, HEAD' });
      try {
        const result = queryServices(await catalog(request, env), url.searchParams);
        if (result.error) return json({ error: result.error }, 400, { 'cache-control': 'no-store' });
        result.data = await applyReviews(result.data, env);
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
