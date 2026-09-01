'use client'

import { useState } from 'react'
import { FileText, Zap, Users, DollarSign, CheckCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CloudStorageSelector } from '@/components/cloud-storage-selector'
import { InvoicesPanel } from '@/components/invoices-panel'

export default function AuthenticatedDashboard() {
  const [activeTab, setActiveTab] = useState('upload')
  const [hasActiveSubscription] = useState(false)
  const [trialDaysRemaining] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">Blueprint Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              {!hasActiveSubscription && trialDaysRemaining <= 0 && (
                <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">
                    Subscription status pending
                  </p>
                </div>
              )}
              <Button variant="outline" size="sm">Account</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-md p-1">
            <TabsTrigger value="upload" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Upload & Review</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="cosign" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Co-Signing</span>
              <span className="sm:hidden">Co-Sign</span>
            </TabsTrigger>
            <TabsTrigger value="invoicing" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Invoicing</span>
              <span className="sm:hidden">Invoice</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Upload & AI Review */}
          <TabsContent value="upload" className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload & AI Review</h2>
                  <p className="text-gray-600 mt-1">Get AI-powered risk analysis with Gemini + pgvector</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>

              {/* Upload Section */}
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">Upload Document</h3>
                <CloudStorageSelector
                  onFileSelected={(response) => {
                    console.log('File selected:', response)
                    setShowUploadModal(false)
                  }}
                  onClose={() => setShowUploadModal(false)}
                />
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Instant Analysis</p>
                  <p className="text-sm text-gray-600">Get AI insights immediately after upload</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Risk Detection</p>
                  <p className="text-sm text-gray-600">Identify potential issues before signing</p>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No documents uploaded yet</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Upload Your First Document</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Co-Signing */}
          <TabsContent value="cosign" className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Co-Signing Workflow</h2>
                  <p className="text-gray-600 mt-1">Collaborate with others via Brevo email workflow</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-3">How Co-Signing Works:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li><span className="font-semibold">1.</span> Upload a document</li>
                    <li><span className="font-semibold">2.</span> Add co-signer email addresses</li>
                    <li><span className="font-semibold">3.</span> System sends Brevo email invitations</li>
                    <li><span className="font-semibold">4.</span> Co-signers review and sign</li>
                    <li><span className="font-semibold">5.</span> All signatures collected automatically</li>
                  </ol>
                </div>

                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-900">
                    <strong>Brevo Integration:</strong> Secure email-based signing workflow with audit logs
                  </p>
                </div>
              </div>

              <div className="text-center py-8">
                <Button className="bg-blue-600 hover:bg-blue-700">Start Co-Signing</Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Invoicing */}
          <TabsContent value="invoicing" className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Invoicing & Billing</h2>
                  <p className="text-gray-600 mt-1">Create and manage invoices with subscription management</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>

              <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Subscription</h3>
                <p className="text-sm text-gray-700">Your active subscription or trial details will appear here once available.</p>
              </div>

              {/* Invoices Panel */}
              <InvoicesPanel onBreadcrumbChange={(text) => console.log('Breadcrumb:', text)} />
            </div>
          </TabsContent>

          {/* Tab: Documents */}
          <TabsContent value="documents" className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Documents</h2>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No documents yet</p>
                <p className="text-sm mb-4">Start by uploading a document in the Upload & Review tab</p>
                <Button
                  onClick={() => setActiveTab('upload')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upload Now
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
