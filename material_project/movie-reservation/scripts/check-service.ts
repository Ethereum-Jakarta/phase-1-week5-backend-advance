// scripts/check-services.ts
const services = [
  { name: 'Users Service', url: 'http://localhost:3001' },
  { name: 'Theaters Service', url: 'http://localhost:3002' },
  { name: 'Reservations Service', url: 'http://localhost:3003' },
  { name: 'Movie Service', url: 'http://localhost:3004' },
  { name: 'Tieckets Service', url: 'http://localhost:3005' }
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