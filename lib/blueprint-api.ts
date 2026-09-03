import { getBackendUrl } from './api-client'

type BlueprintResponse<T> = {
  ok: boolean
  status: number
  data: T
  forwarded?: boolean
  error?: string
}

export async function blueprintRequest<T>(path: string, init: RequestInit = {}): Promise<BlueprintResponse<T>> {
  const res = await fetch(getBackendUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const payload = await res.json().catch(() => null)

  const envelope = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {}
  const nestedData = 'data' in envelope && envelope.data !== undefined ? envelope.data as T : (payload as T)

  return {
    ok: res.ok,
    status: res.status,
    data: nestedData,
    forwarded: typeof envelope.forwarded === 'boolean' ? envelope.forwarded : undefined,
    error: typeof envelope.error === 'string' ? envelope.error : (typeof envelope.message === 'string' ? envelope.message : undefined),
  }
}

export async function reviewDocument(prompt: string, documentText?: string) {
  return blueprintRequest<{ summary?: string; risks?: string[]; answer?: string; message?: string }>('/ai/review', {
    method: 'POST',
    body: JSON.stringify({ prompt, documentText }),
  })
}

export async function inviteCoSigner(payload: {
  firstName: string
  lastName: string
  email: string
  documentId?: string
  role?: string
}) {
  return blueprintRequest<{ id: string; status: string; email: string; invitedAt: string }>('/document/invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function saveInvoice(payload: Record<string, unknown>) {
  return blueprintRequest<{ id: string; status: string; message?: string }>('/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
