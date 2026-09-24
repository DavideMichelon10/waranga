export default async () => new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
export const config = { path: ['/api/waitlist', '/api/newsletter'] };
