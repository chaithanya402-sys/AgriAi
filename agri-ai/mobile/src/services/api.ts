import AsyncStorage from '@react-native-async-storage/async-storage'

// Use environment variable or fallback to detected host IP
export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://172.16.129.105:8000'

const SERVER_URL_KEY = 'agriai_server_url'
let inMemoryBaseUrl: string = DEFAULT_API_BASE_URL.replace(/\/+$/, '')

export async function getApiBaseUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(SERVER_URL_KEY)
    if (saved && saved.trim()) {
      inMemoryBaseUrl = saved.trim().replace(/\/+$/, '')
      return inMemoryBaseUrl
    }
  } catch {}
  inMemoryBaseUrl = DEFAULT_API_BASE_URL.replace(/\/+$/, '')
  return inMemoryBaseUrl
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const clean = url.trim().replace(/\/+$/, '')
  inMemoryBaseUrl = clean
  API_BASE_URL = clean
  try {
    await AsyncStorage.setItem(SERVER_URL_KEY, clean)
  } catch (err) {
    console.warn('Failed to persist server URL:', err)
  }
}

export async function resetApiBaseUrl(): Promise<string> {
  inMemoryBaseUrl = DEFAULT_API_BASE_URL.replace(/\/+$/, '')
  API_BASE_URL = inMemoryBaseUrl
  try {
    await AsyncStorage.removeItem(SERVER_URL_KEY)
  } catch (err) {
    console.warn('Failed to reset server URL:', err)
  }
  return inMemoryBaseUrl
}

export async function testServerConnection(url: string): Promise<{ ok: boolean; message: string }> {
  try {
    const clean = url.trim().replace(/\/+$/, '')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(`${clean}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      return { ok: true, message: `Connected! (Mode: ${data.demo_mode ? 'Demo' : 'Production'})` }
    }
    return { ok: false, message: `Server error HTTP ${res.status}` }
  } catch (e: any) {
    return { ok: false, message: e.message || 'Cannot reach server' }
  }
}

export let API_BASE_URL = DEFAULT_API_BASE_URL

const TOKEN_KEY = 'agriai_auth_token'
let inMemoryToken: string | null = null

export async function getAuthToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY)
    inMemoryToken = token
    return token
  } catch {
    return inMemoryToken
  }
}

export async function setAuthToken(token: string | null): Promise<void> {
  inMemoryToken = token
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token)
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY)
    }
  } catch (err) {
    console.warn('Failed to persist auth token:', err)
  }
}

interface RequestOptions {
  method?: string
  body?: any
  auth?: boolean
  headers?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {} } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const reqHeaders: Record<string, string> = {
    ...headers,
  }

  if (!isFormData && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = await getAuthToken()
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const baseUrl = await getApiBaseUrl()
  API_BASE_URL = baseUrl
  const url = `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const fetchOptions: RequestInit = {
    method,
    headers: reqHeaders,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  }

  let res: Response
  try {
    res = await fetch(url, fetchOptions)
  } catch (err: any) {
    throw new ApiError(
      `Cannot connect to server at ${baseUrl}. ${err.message || ''}. Please check if your phone is on the same Wi-Fi as your computer.`,
      0
    )
  }

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`
    try {
      const data = await res.json()
      detail = data.detail || (typeof data === 'string' ? data : JSON.stringify(data))
    } catch {
      // Ignore text parse failure
    }
    throw new ApiError(detail, res.status)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json() as Promise<T>
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string; user: any }>(
      '/auth/login/json',
      { method: 'POST', body: { email, password }, auth: false }
    ),
  register: (data: { name: string; email: string; password: string; phone?: string; location?: string }) =>
    request<{ access_token: string; token_type: string; user: any }>(
      '/auth/register',
      { method: 'POST', body: data, auth: false }
    ),
  me: () => request('/auth/me'),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data: { name?: string; fullName?: string; phone?: string; location?: string }) =>
    request('/auth/profile', { method: 'PUT', body: data }),
}

// Farms API
export const farmApi = {
  list: () => request<any[]>('/farms'),
  create: (data: Record<string, any>) => request('/farms', { method: 'POST', body: data }),
  get: (id: number) => request(`/farms/${id}`),
  update: (id: number, data: Record<string, any>) =>
    request(`/farms/${id}`, { method: 'PUT', body: data }),
  remove: (id: number) => request(`/farms/${id}`, { method: 'DELETE' }),
  createField: (farmId: number, data: Record<string, any>) =>
    request(`/farms/${farmId}/fields`, { method: 'POST', body: data }),
  listFields: (farmId: number) => request<any[]>(`/farms/${farmId}/fields`),
  removeField: (fieldId: number) => request(`/farms/fields/${fieldId}`, { method: 'DELETE' }),
}
