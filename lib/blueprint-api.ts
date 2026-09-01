export type ApiEnvelope<T> = {
  ok: boolean
  status: number
  data: T
  forwarded?: boolean
  error?: string
}

export async function blueprintRequest<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const payload = await res.json().catch(() => null)

  return {
    ok: res.ok,
    status: res.status,
    data: (payload && 'data' in payload ? payload.data : payload) as T,
    forwarded: typeof payload?.forwarded === 'boolean' ? payload.forwarded : undefined,
    error: payload?.error ?? undefined,
  }
}

export async function reviewDocument(prompt: string, documentText?: string) {
  return blueprintRequest<{ summary: string; risks: string[]; answer: string }>('/api/ai/review', {
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
  return blueprintRequest<{ id: string; status: string; email: string; invitedAt: string }>('/api/document/invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function saveInvoice(payload: Record<string, unknown>) {
  return blueprintRequest<{ id: string; status: string; message?: string }>('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
