const configuredApiBase = import.meta.env.VITE_API_BASE_URL
const API_BASE = (configuredApiBase || (import.meta.env.DEV ? 'http://localhost:8080' : '')).replace(/\/+$/, '')

export type ApiUser = { id: number; displayName: string; email: string; area: string; creditBalance: number }
export type ApiAuth = { accessToken: string; user: ApiUser }
export type ApiItem = {
  id: number; title: string; description?: string; category: string; size: string; condition: string
  color: string; brand?: string; credits: number; imageUrl?: string; status: string
  owner: ApiUser
}
export type ApiExchange = {
  id: number; requesterId: number; requesterName: string; ownerId: number; ownerName: string
  requestedItem: ApiItem; offeredItem?: ApiItem; type: 'DIRECT_SWAP' | 'CREDITS'; status: string
  creditDifference: number; requesterConfirmed: boolean; ownerConfirmed: boolean
}
export type ApiCreditActivity = { id: number; amount: number; description: string; exchangeId?: number; createdAt: string }
export type ApiReport = { id: number; reporterId: number; reporterName: string; itemId: number; itemTitle: string; reason: string; details?: string; status: string; createdAt: string }
export type ApiProMembership = { active: boolean; plan: 'MONTHLY' | 'ANNUAL' | null; expiresAt: string | null }
export type ApiProOrder = { orderId: string; keyId: string; amount: number; currency: string; plan: 'MONTHLY' | 'ANNUAL' }
export type ApiProCode = { code: string; plan: 'MONTHLY' | 'ANNUAL'; expiresAt: string | null }
export type ApiAdminUser = { id: number; displayName: string; email: string; area: string; creditBalance: number; role: 'MEMBER' | 'MODERATOR' | 'ADMIN' }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error('Set VITE_API_BASE_URL to the deployed Closet Cycle API URL.')
  }
  const headers = new Headers(init?.headers)
  if (!(init?.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = path.startsWith('/api/auth/') ? null : localStorage.getItem('closet_cycle_access_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || body.message || body.errors?.join(', ') || `API request failed (${response.status})`)
  return body as T
}

export const closetCycleApi = {
  login: (input: object) => api<ApiAuth>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: object) => api<ApiAuth>('/api/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  listItems: (filters: Record<string, string> = {}) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
    const encoded = query.toString()
    return api<ApiItem[]>(`/api/items${encoded ? `?${encoded}` : ''}`)
  },
  createItem: (input: object) => api<ApiItem>('/api/items', { method: 'POST', body: JSON.stringify(input) }),
  updateItem: (id: number, input: object) => api<ApiItem>(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  changeItemStatus: (id: number, ownerId: number, status: string) => api<ApiItem>(`/api/items/${id}/status?ownerId=${ownerId}&status=${status}`, { method: 'PATCH' }),
  ownerItems: (ownerId: number) => api<ApiItem[]>(`/api/items/owner/${ownerId}`),
  uploadImage: async (file: File) => {
    const data = new FormData(); data.append('file', file)
    return api<{ url: string }>('/api/files/images', { method: 'POST', body: data })
  },
  requestExchange: (input: object) => api<ApiExchange>('/api/exchanges', { method: 'POST', body: JSON.stringify(input) }),
  listExchanges: (userId: number) => api<ApiExchange[]>(`/api/exchanges?userId=${userId}`),
  actOnExchange: (id: number, action: 'accept' | 'decline' | 'cancel' | 'arrange' | 'confirm', identity: string, userId: number) =>
    api<ApiExchange>(`/api/exchanges/${id}/${action}?${identity}=${userId}`, { method: 'POST' }),
  wallet: (userId: number) => api<ApiUser>(`/api/wallet/${userId}`),
  updateProfile: (userId: number, input: { displayName: string; area: string }) => api<ApiUser>(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(input) }),
  creditActivity: (userId: number) => api<ApiCreditActivity[]>(`/api/wallet/${userId}/activity`),
  createReport: (itemId: number, input: { reason: string; details: string }) => api<ApiReport>(`/api/items/${itemId}/reports`, { method: 'POST', body: JSON.stringify(input) }),
  adminReports: () => api<ApiReport[]>('/api/admin/reports'),
  updateReport: (id: number, status: 'RESOLVED' | 'DISMISSED') => api<ApiReport>(`/api/admin/reports/${id}?status=${status}`, { method: 'PATCH' }),
  proMembership: () => api<ApiProMembership>('/api/pro/membership'),
  redeemProCode: (code: string) => api<ApiProMembership>('/api/pro/activation-codes/redeem', { method: 'POST', body: JSON.stringify({ code }) }),
  createProOrder: (plan: 'MONTHLY' | 'ANNUAL') => api<ApiProOrder>('/api/pro/payments/orders', { method: 'POST', body: JSON.stringify({ plan }) }),
  verifyProPayment: (input: { orderId: string; paymentId: string; signature: string }) => api<ApiProMembership>('/api/pro/payments/verify', { method: 'POST', body: JSON.stringify(input) }),
  createAdminProCode: (input: { plan: 'MONTHLY' | 'ANNUAL'; expiresAt?: string }) => api<ApiProCode>('/api/admin/pro-codes', { method: 'POST', body: JSON.stringify(input) }),
  adminUsers: () => api<ApiAdminUser[]>('/api/admin/users'),
  updateAdminUserRole: (id: number, role: 'MEMBER' | 'MODERATOR' | 'ADMIN') =>
    api<ApiAdminUser>(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
}

export const fromApiItem = (item: ApiItem) => ({
  id: item.id, name: item.title, image: item.imageUrl?.startsWith('/') ? `${API_BASE}${item.imageUrl}` : item.imageUrl || '', size: item.size,
  condition: item.condition, credits: item.credits, area: item.owner.area,
  category: item.category, color: item.color || '', description: item.description || '',
  brand: item.brand || 'Unbranded', ownerName: item.owner.displayName, ownerId: item.owner.id, status: item.status,
})
