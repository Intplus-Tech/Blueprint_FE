'use client'

import axios from 'axios'

export function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')
}

export function getBackendUrl(path: string) {
  const endpoint = path.trim()
  if (!endpoint) return getBackendBaseUrl()
  if (/^https?:\/\//i.test(endpoint)) return endpoint

  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const baseUrl = getBackendBaseUrl()
  const apiV1Base = baseUrl.replace(/\/api\/v1\/?$/, '/api/v1')
  const apiRootBase = baseUrl.replace(/\/api\/v1\/?$/, '/api')
  const rootBase = baseUrl.replace(/\/api\/v1\/?$/, '')

  // Backend-specific routes that do not live under /api/v1.
  if (normalizedPath === '/session') return `${apiRootBase}/session`
  if (normalizedPath === '/cookie-consent') return `${rootBase}/cookie-consent`
  if (normalizedPath === '/health') return `${rootBase}/health`

  if (normalizedPath.startsWith('/api/v1')) {
    return `${apiV1Base}${normalizedPath.replace(/^\/api\/v1/, '')}`
  }

  if (normalizedPath.startsWith('/api/')) {
    return `${apiRootBase}${normalizedPath.replace(/^\/api/, '')}`
  }

  return `${apiV1Base}${normalizedPath}`
}

// Axios instance with default configuration
export const axiosInstance = axios.create({
  baseURL: getBackendBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for auth
})

// Add request/response interceptors if needed
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error)
    return Promise.reject(error)
  },
)

/** POSTs JSON to the backend API and returns the parsed response. */
export async function postJson<T>(
  url: string,
  payload: T,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(getBackendUrl(url), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, data }
}

// ============ Cloud Storage Integration ============

export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive' | 'local'

/** Upload file to backend */
export async function uploadFile(file: File, metadata?: Record<string, any>) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    const response = await axiosInstance.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to upload file:', error)
    throw error
  }
}

/** Delete uploaded file by publicId */
export async function deleteUpload(publicId: string) {
  try {
    const response = await axiosInstance.delete(`/uploads/${publicId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete upload:', error)
    throw error
  }
}

/** Get Google Drive auth URL */
export async function getGoogleAuthUrl() {
  try {
    const response = await axiosInstance.get('/auth/google/auth-url')
    return response.data
  } catch (error) {
    console.error('Failed to get Google auth URL:', error)
    throw error
  }
}

/** Get OneDrive auth URL */
export async function getOneDriveAuthUrl() {
  try {
    const response = await axiosInstance.get('/auth/onedrive/auth-url')
    return response.data
  } catch (error) {
    console.error('Failed to get OneDrive auth URL:', error)
    throw error
  }
}

/** Get Dropbox auth URL */
export async function getDropboxAuthUrl() {
  try {
    const response = await axiosInstance.get('/auth/dropbox/auth-url')
    return response.data
  } catch (error) {
    console.error('Failed to get Dropbox auth URL:', error)
    throw error
  }
}

/** Handle Google OAuth callback */
export async function handleGoogleCallback(code: string) {
  try {
    const response = await axiosInstance.get('/auth/google/callback', {
      params: { code },
    })
    return response.data
  } catch (error) {
    console.error('Google OAuth callback failed:', error)
    throw error
  }
}

/** Persistence to localStorage has been removed for privacy reasons. */
export function persistAuthSession(_payload: any) {
  if (typeof window === 'undefined') return
  // intentionally no-op: storage persistence disabled
  console.warn('persistAuthSession: localStorage persistence disabled')
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  // intentionally no-op: storage persistence disabled
  console.warn('clearAuthSession: localStorage persistence disabled')
}

/** Register user */
export async function registerUser(data: {
  fullName: string
  email: string
  industry: string
  password: string
  role?: string
}) {
  try {
    const response = await axiosInstance.post('/auth/register', data)
    return response.data
  } catch (error) {
    console.error('Registration failed:', error)
    throw error
  }
}

/** Login user */
export async function loginUser(data: { email: string; password: string }) {
  try {
    const response = await axiosInstance.post('/auth/login', data)
    return response.data
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}
