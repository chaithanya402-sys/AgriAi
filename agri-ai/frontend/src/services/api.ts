/**
 * Central API client. All requests go to the FastAPI backend.
 * Auth token is attached automatically from localStorage.
 * All third-party (weather/market) calls are proxied through the backend —
 * never reach frontend keys here.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api'

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {} } = options

  const isFormData = body instanceof FormData

  const requestHeaders: Record<string, string> = {
    ...headers,
  }
  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = localStorage.getItem('agriai_token')
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let detail = 'Something went wrong'
    try {
      const data = await res.json()
      detail = data.detail || JSON.stringify(data)
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(detail, res.status)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; location?: string }) =>
    request('/auth/register', { method: 'POST', body: data, auth: false }),
  login: (email: string, password: string) =>
    request('/auth/login/json', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),
}

// ---- Farms ----
export const farmApi = {
  list: () => request('/farms'),
  create: (data: Record<string, unknown>) => request('/farms', { method: 'POST', body: data }),
  get: (id: number) => request(`/farms/${id}`),
  update: (id: number, data: Record<string, unknown>) =>
    request(`/farms/${id}`, { method: 'PUT', body: data }),
  remove: (id: number) => request(`/farms/${id}`, { method: 'DELETE' }),
  createField: (farmId: number, data: Record<string, unknown>) =>
    request(`/farms/${farmId}/fields`, { method: 'POST', body: data }),
  listFields: (farmId: number) => request(`/farms/${farmId}/fields`),
  removeField: (fieldId: number) => request(`/farms/fields/${fieldId}`, { method: 'DELETE' }),
}

export const dashboardApi = {
  overview: () => request('/dashboard'),
}

export default request
