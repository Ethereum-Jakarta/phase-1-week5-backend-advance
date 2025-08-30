// monitor/health-check.ts
import { Elysia } from 'elysia';

const SERVICES = [
  { name: 'Gateway', url: 'http://localhost:8000/health' },
  { name: 'User Service', url: 'http://localhost:3000/health' },
  { name: 'Product Service', url: 'http://localhost:3001/health' },
  { name: 'Order Service', url: 'http://localhost:3002/health' }
];

const app = new Elysia()
  .get('/monitor', async () => {
    const results = await Promise.all(
      SERVICES.map(async (service) => {
        try {
          const start = Date.now();
          const response = await fetch(service.url);
          const responseTime = Date.now() - start;
          
          return {
            service: service.name,
            status: response.ok ? 'UP' : 'DOWN',
            responseTime: `${responseTime}ms`,
            lastChecked: new Date().toISOString()
          };
        } catch (error) {
          return {
            service: service.name,
            status: 'DOWN',
            // @ts-ignore
            error: error.message,
            lastChecked: new Date().toISOString()
          };
        }
      })
    );

    return {
      timestamp: new Date().toISOString(),
      services: results
    };
  })
  .listen(3500);

console.log('Monitor running on http://localhost:3500/monitor');