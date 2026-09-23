export { default } from '../../server/subscribe.js';
export const config = {
  path: ['/api/waitlist', '/api/newsletter'],
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: 'ip' },
};
