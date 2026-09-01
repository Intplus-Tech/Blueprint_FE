'use client'

import axios from 'axios'

// Axios instance with default configuration
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
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

/** POSTs JSON to a local route handler and returns the parsed response. */
export async function postJson<T>(
  url: string,
  payload: T,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, data }
}

// ============ Cloud Storage Integration ============

export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive' | 'local'

export interface UploadResponse {
  id: string
  publicId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  downloadUrl?: string
}

export interface CloudFile {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modifiedTime?: string
  mimeType?: string
  downloadUrl?: string
}

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
    return response.data as UploadResponse
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

/** Register user */
export async function registerUser(data: {
  email: string
  password: string
  name?: string
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
