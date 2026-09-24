import { createHostingerServer } from './server/hostinger.js';

const server = createHostingerServer();
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Wananga server ready'));
