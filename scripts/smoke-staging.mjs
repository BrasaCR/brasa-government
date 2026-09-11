const baseUrl = String(process.env.STAGING_BASE_URL || '').replace(/\/$/, '');
if (!/^https:\/\//.test(baseUrl)) throw new Error('STAGING_BASE_URL must be an https URL');
for (const path of ['/health', '/api/v1/services?countryCode=CR&limit=1', '/api/v1/experiences/service-navigator?topic=water&locale=es&countryCode=CR']) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  const body = await response.json();
  const validApi = path.includes('/experiences/') ? body.data?.type === 'government-experience' && body.data?.boundaries?.eligibilityDecision === false : Array.isArray(body.data);
  if (!response.ok || (path.startsWith('/api/') && !validApi)) throw new Error(`${path} failed (${response.status})`);
  console.log(JSON.stringify({ check: path, status: response.status }));
}
