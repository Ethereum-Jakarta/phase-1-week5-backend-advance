// scripts/check-services.ts
const services = [
  { name: 'API Gateway', url: 'http://localhost:3000' },
  { name: 'User Service', url: 'http://localhost:3001' },
  { name: 'Catalog Service', url: 'http://localhost:3002' },
  { name: 'Borrowing Service', url: 'http://localhost:3003' },
  { name: 'Review Service', url: 'http://localhost:3004' },
  { name: 'Notification Service', url: 'http://localhost:3005' }
]

async function checkServices() {
  for (const service of services) {
    try {
      const response = await fetch(service.url)
      console.log(`${service.name}: ${response.ok ? 'OK' : 'Failed'}`)
    } catch (error) {
      console.error(`${service.name}: Failed - ${error.message}`)
    }
  }
}

checkServices()