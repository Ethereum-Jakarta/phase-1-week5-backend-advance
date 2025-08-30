// src/utils/proxy.ts
export async function proxy(request: Request, targetUrl: string) {
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // @ts-ignore
        ...Object.fromEntries(request.headers)
      },
      body: request.method !== 'GET' ? await request.text() : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error: any) {
    console.error('Proxy error:', error)
    throw new Error(`Service unavailable: ${error.message}`)
  }
}