// Базовый composable для запросов к Google Apps Script

export function useApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.appsScriptUrl as string

  async function get<T>(params: Record<string, string>): Promise<T> {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString())
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json.data as T
  }

  async function post<T>(body: Record<string, unknown>): Promise<T> {
    const res = await fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json.data as T
  }

  return { get, post }
}
