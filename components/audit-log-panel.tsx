'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadCloud, Eye, EyeOff } from 'lucide-react'
import { exportAuditLog } from '@/lib/export'
import type { AuditExportRow } from '@/lib/export'

export interface AuditLogEntry {
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

export interface AuditLogPanelProps {
  docId?: string
  logs: AuditLogEntry[]
  onClose?: () => void
}

/**
 * Audit log panel for viewing and exporting co-signer and document activity logs
 */
export function AuditLogPanel({ docId, logs, onClose }: AuditLogPanelProps) {
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set())
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx'>('csv')

  const toggleDetails = (id: string) => {
    setShowDetails((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExport = async () => {
    const dataToExport: AuditExportRow[] = logs.map((log) => ({
      docId: log.docId,
      documentName: log.documentName,
      signerName: log.signerName,
      signerEmail: log.signerEmail,
      status: log.status,
      inviteSentDate: log.inviteSentDate,
      signedDate: log.signedDate,
      ipAddress: log.ipAddress,
      action: log.action,
    }))

    await exportAuditLog(dataToExport, selectedFormat)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Audit Log</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Export Controls */}
      <div className="flex gap-2">
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'xlsx')}
          className="text-xs border border-border rounded px-2 py-1 bg-card text-card-foreground"
        >
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </select>
        <Button
          size="sm"
          onClick={handleExport}
          disabled={logs.length === 0}
          className="flex items-center gap-1"
        >
          <DownloadCloud className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Audit Log List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No audit logs available</p>
        ) : (
          logs.map((log, idx) => {
            const entryId = `${log.docId}-${idx}`
            const isExpanded = showDetails.has(entryId)

            return (
              <div
                key={entryId}
                className="border border-border rounded-lg p-3 bg-muted/30 space-y-2"
              >
                <button
                  onClick={() => toggleDetails(entryId)}
                  className="w-full flex items-center justify-between hover:bg-muted/50 p-2 -m-2 rounded transition-colors"
                >
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {log.signerName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{log.signerEmail}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: <span className="font-semibold text-card-foreground">{log.status}</span>
                    </p>
                  </div>
                  {isExpanded ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </button>

                {isExpanded && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span>Document:</span>
                      <span className="font-medium text-card-foreground">{log.documentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invite Sent:</span>
                      <span className="font-medium text-card-foreground">{log.inviteSentDate}</span>
                    </div>
                    {log.signedDate && (
                      <div className="flex justify-between">
                        <span>Signed:</span>
                        <span className="font-medium text-card-foreground">{log.signedDate}</span>
                      </div>
                    )}
                    {log.ipAddress && (
                      <div className="flex justify-between">
                        <span>IP Address:</span>
                        <span className="font-medium text-card-foreground font-mono">{log.ipAddress}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Action:</span>
                      <span className="font-medium text-card-foreground">{log.action}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

