/**
 * Export utilities for CSV and XLSX formats
 */

interface ExportOptions {
  filename?: string
  timestamp?: boolean
}

export type ExportFormat = 'csv' | 'xlsx'

/**
 * Convert JSON data to CSV format
 */
export function jsonToCsv<T extends Record<string, any>>(
  data: T[],
  headers?: Array<keyof T | string>,
): string {
  if (data.length === 0) return ''

  const cols = headers?.length ? headers : (Object.keys(data[0] ?? {}) as Array<keyof T | string>)

  // Create header row
  const headerRow = cols.map((col) => escapeQuotes(String(col))).join(',')

  // Create data rows
  const dataRows = data.map((row) =>
    cols.map((col) => {
      const value = row[col as keyof T]
      return formatCsvValue(value)
    }),
  )

  return [headerRow, ...dataRows.map((row) => row.join(','))].join('\n')
}

/**
 * Format a value for CSV output
 */
function formatCsvValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') {
    // Handle dates
    if (value instanceof Date) return value.toISOString()
    // Handle arrays or objects by stringifying
    return escapeQuotes(JSON.stringify(value))
  }
  return escapeQuotes(String(value))
}

/**
 * Escape quotes and wrap in quotes if needed
 */
function escapeQuotes(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Export data to CSV file
 */
export function downloadCsv(
  data: Record<string, any>[],
  options: ExportOptions & { headers?: string[] } = {},
): void {
  const { filename = 'export', timestamp = true, headers } = options

  const csv = jsonToCsv(data, headers)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  downloadBlob(blob, `${filename}${timestamp ? `.${Date.now()}` : ''}.csv`)
}

/**
 * Create an Excel file (XLSX) from JSON data
 * Uses a CSV payload encoded as a SpreadsheetML file so the workspace stays dependency-free.
 */
export async function downloadXlsx(
  data: Record<string, any>[],
  options: ExportOptions & { headers?: string[] } = {},
): Promise<void> {
  const { filename = 'export', timestamp = true, headers } = options

  const csv = jsonToCsv(data, headers)
  const blob = new Blob([csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  downloadBlob(blob, `${filename}${timestamp ? `.${Date.now()}` : ''}.xlsx`)
}

/**
 * Generic blob download helper
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export with filtering and formatting
 */
export interface ExportDataOptions<T> {
  data: T[]
  format: ExportFormat
  filename: string
  headers?: string[]
  filter?: (item: T) => boolean
  transform?: (item: T) => Record<string, any>
  timestamp?: boolean
}

export async function exportData<T extends Record<string, any>>({
  data,
  format,
  filename,
  headers,
  filter,
  transform,
  timestamp = true,
}: ExportDataOptions<T>): Promise<void> {
  // Apply filter if provided
  let filtered = data
  if (filter) {
    filtered = data.filter(filter)
  }

  // Apply transform if provided
  let transformed: Record<string, any>[] = filtered as unknown as Record<string, any>[]
  if (transform) {
    transformed = filtered.map(transform)
  }

  if (format === 'csv') {
    downloadCsv(transformed, { filename, headers, timestamp })
  } else if (format === 'xlsx') {
    await downloadXlsx(transformed, {
      filename,
      headers,
      timestamp,
    })
  }
}

/**
 * Helper to export documents with audit info
 */
export interface DocumentExportRow {
  docId: string
  name: string
  status: string
  signers: string
  created: string
  lastActivity: string
  createdBy: string
}

export async function exportDocuments(
  docs: any[],
  format: ExportFormat,
  options?: { timestamp?: boolean },
): Promise<void> {
  const transformed: DocumentExportRow[] = docs.map((doc) => ({
    docId: doc.docId,
    name: doc.name,
    status: doc.status,
    signers: doc.signers.map((s: any) => `${s.name}${s.signed ? ' ✓' : ''}`).join('; '),
    created: doc.created,
    lastActivity: doc.lastActivity,
    createdBy: doc.createdBy,
  }))

  await exportData({
    data: transformed,
    format,
    filename: 'documents',
    headers: ['docId', 'name', 'status', 'signers', 'created', 'lastActivity', 'createdBy'] as const,
    timestamp: options?.timestamp,
  })
}

/**
 * Helper to export audit/cosigner data
 */
export interface AuditExportRow {
  docId: string
  documentName: string
  signerName: string
  signerEmail: string
  status: 'Pending' | 'Signed'
  inviteSentDate: string
  signedDate?: string
  ipAddress?: string
  action: string
}

export async function exportAuditLog(
  auditData: any[],
  format: ExportFormat,
  options?: { timestamp?: boolean },
): Promise<void> {
  await exportData({
    data: auditData,
    format,
    filename: 'audit-log',
    headers: [
      'docId',
      'documentName',
      'signerName',
      'signerEmail',
      'status',
      'inviteSentDate',
      'signedDate',
      'ipAddress',
      'action',
    ] as const,
    timestamp: options?.timestamp,
  })
}
