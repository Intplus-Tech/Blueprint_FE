"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft, FileText, Type, PenTool, Plus, UserPlus,
  Image as ImageIcon, Download, X, Settings, Bell, LogOut, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignaturePanel, type SavedSignature } from "@/components/signature-panel";
import { ToolInfoPopover } from "@/components/tool-info-popover";
import { NewDocumentPanel, AddSignerPanel, AIReviewPanel, ApprovalWatermark, type Signer } from "@/components/document-panels";
import { inviteCoSigner } from '@/lib/blueprint-api'
import { createNotification } from '@/lib/notifications'
import { useNotifications } from '@/lib/use-notifications'
import { AITorneyChat } from "@/components/ai-torney-chat";
import { NotificationWidget } from "@/components/notification-widget";
import { NotificationCenter } from "@/components/notification-center";
import { PdfPageCanvas } from "@/components/pdf-page-canvas";
import { TrialGateModal } from "@/components/trial-gate-modal";
import { getPdfjs, PDF_STORAGE_KEY, PDF_NAME_KEY, type PdfDocumentProxy } from "@/lib/pdf";

const FALLBACK_PAGE_COUNT = 1;
const DEFAULT_DOC_NAME = "Untitled document";

type ToolId = "view" | "textField" | "signature" | "newDocument" | "cosigner" | "aiReview" | "download";
type PlacedSignature = SavedSignature & { x: number; y: number };

export default function DocumentPage() {
  return (
    <Suspense fallback={null}>
      <DocumentPageInner />
    </Suspense>
  );
}

function DocumentPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthenticated = searchParams.get("from") === "dashboard";

  const [currentPage, setCurrentPage] = useState(1);
  const [gateFeature, setGateFeature] = useState<"ai-review" | "cosign" | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [panelTab, setPanelTab] = useState<string>("history");
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [placed, setPlaced] = useState<PlacedSignature | null>(null);
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications();

  const [pdfDoc, setPdfDoc] = useState<PdfDocumentProxy | null>(null);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [docName, setDocName] = useState(DEFAULT_DOC_NAME);

  // Load a PDF handed off from the landing page / dashboard upload flow.
  useEffect(() => {
    let active = true;

    async function load() {
      const storedName = sessionStorage.getItem(PDF_NAME_KEY);
      if (storedName) setDocName(storedName);

      const dataUrl = sessionStorage.getItem(PDF_STORAGE_KEY);
      if (!dataUrl) return;

      setPdfStatus("loading");
      try {
        const pdfjsLib = await getPdfjs();
        const doc = await pdfjsLib.getDocument(dataUrl).promise;
        if (!active) return;
        setPdfDoc(doc);
        setPdfNumPages(doc.numPages);
        setCurrentPage(1);
        setPdfStatus("ready");
      } catch (err) {
        console.error("Failed to load PDF:", err);
        if (active) setPdfStatus("error");
      }
    }

    load();
    return () => { active = false; };
  }, []);

  const pageCount = pdfDoc ? pdfNumPages : FALLBACK_PAGE_COUNT;
  const signaturePanelOpen = activeTool === "signature";
  const [aiReviewStage, setAiReviewStage] = useState<"confirm" | "watermark" | "chat">("confirm");

  function handleToolClick(tool: ToolId) {
    if (tool === "download") {
      window.print();
      return;
    }

    if (tool === "cosigner" && !isAuthenticated) {
      setGateFeature("cosign");
      return;
    }

    if (tool === "aiReview" && !isAuthenticated) {
      setGateFeature("ai-review");
      return;
    }

    setActiveTool((prev) => (prev === tool ? null : tool));
  }

  function handleInsertSignature(sig: SavedSignature) {
    setSavedSignatures((prev) => (prev.some((s) => s.id === sig.id) ? prev : [sig, ...prev]));
    setPlaced({ ...sig, x: 60, y: 40 });
    setActiveTool(null);
  }

  function handleDeleteSaved(id: string) {
    setSavedSignatures((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddSigner(signer: Omit<Signer, "id" | "status">) {
    const newSigner = { ...signer, id: crypto.randomUUID(), status: "Pending" as const };
    setSigners((prev) => [...prev, newSigner]);
    createNotification.document(
      'Signer added',
      `${newSigner.firstName} ${newSigner.lastName || ''}`.trim() || newSigner.email || 'The signer was added to this document.'
    );
  }

  function handleResendInvite(id: string) {
    const signer = signers.find((s) => s.id === id);
    if (!signer) return console.error('Signer not found for resend:', id);

    const firstName = signer.firstName ?? signer.email?.split('@')[0] ?? '';
    const lastName = signer.lastName ?? '';

    inviteCoSigner({ firstName, lastName, email: signer.email ?? '' })
      .then((res) => {
        if (res.ok) {
          createNotification.cosign('Invite sent', `Resent invite to ${signer.firstName} ${signer.lastName || ''}`);
        } else {
          createNotification.system('Invite failed', `Unable to resend invite to ${signer.firstName} ${signer.lastName || ''}`);
        }
      })
      .catch((err) => {
        console.error('Resend invite failed', err);
        createNotification.system('Invite failed', `Unable to resend invite to ${signer.firstName} ${signer.lastName || ''}`);
      });
  }

  function handleNewDocumentSelected(fileName: string) {
    console.log("New document selected:", fileName);
    createNotification.document('Document ready', `${fileName} is ready for review and signing.`);
    setActiveTool(null);
  }

  function handleStartAIReview() {
    createNotification.document('AI review started', 'The document review is now running and will show findings shortly.');
    setAiReviewStage("watermark");
    setTimeout(() => {
      setAiReviewStage("chat");
    }, 1600); 
  }

  function handleCloseAIReview() {  
    setActiveTool(null);
    setAiReviewStage("confirm");
  } 

  const breadcrumb = getBreadcrumb({
    isDragging: isDraggingSignature,
    activeTool,
    panelTab,
    hasSignature: savedSignatures.length > 0 || !!placed,
    isAuthenticated,
    aiReviewStage,
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <header className="flex items-center justify-between bg-brand-600 px-4 py-3 text-white sm:px-6">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-1.5 text-sm font-medium hover:text-brand-100">
          <ChevronLeft className="h-4 w-4" />
          {isAuthenticated ? "Dashboard" : "Back"}
        </Link>
        <span className="max-w-[45%] truncate text-sm font-medium sm:max-w-none">{docName}</span>
        {isAuthenticated ? (
          <div className="flex items-center gap-3 text-white/80">
            <button type="button" className="hover:text-white" aria-label="Settings"><Settings className="h-4 w-4" /></button>
            <button type="button" onClick={() => setNotificationCenterOpen(!notificationCenterOpen)} className="relative hover:text-white" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <Link href="/login" className="hover:text-white" aria-label="Log out"><LogOut className="h-4 w-4" /></Link>
          </div>
        ) : (
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/signup" className="hover:text-brand-100">Sign Up</Link>
            <span className="text-brand-200">/</span>
            <Link href="/login" className="hover:text-brand-100">Sign In</Link>
          </nav>
        )}
      </header>

      <div className="px-4 py-2 text-xs text-gray-500 sm:px-6">{breadcrumb}</div>

      <NotificationWidget position="top-right" maxVisible={3} />
      <NotificationCenter isOpen={notificationCenterOpen} onClose={() => setNotificationCenterOpen(false)} />

      {gateFeature && (
        <TrialGateModal
          feature={gateFeature}
          isActive={true}
          onAccept={() => router.push("/login")}
          onDismiss={() => {
            setGateFeature(null);
            setActiveTool(null);
          }}
          trialDaysRemaining={30}
          subscriptionRequired={false}
        />
      )}

      <div className="relative flex flex-1 gap-4 overflow-hidden p-4 sm:p-6">
        <aside className="hidden w-32 shrink-0 space-y-4 overflow-y-auto sm:block">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => setCurrentPage(n)} className="flex w-full flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex aspect-[3/4] w-full flex-col gap-1.5 overflow-hidden rounded-sm border bg-white p-2.5 shadow-sm transition-colors",
                  currentPage === n ? "border-brand-500 ring-2 ring-brand-200" : "border-gray-200"
                )}
              >
                {pdfDoc ? (
                  <PdfPageCanvas pdfDoc={pdfDoc} pageNumber={n} targetWidth={112} />
                ) : (
                  Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-[3px] w-full rounded-full bg-gray-200" />)
                )}
              </div>
              <span className="text-xs text-gray-500">{n} / {pageCount}</span>
            </button>
          ))}
        </aside>

        <div className="flex flex-1 justify-center overflow-y-auto">
          <div
            ref={pageRef}
            className={cn(
              "relative min-h-[900px] w-full max-w-[560px] bg-white text-[13px] leading-relaxed text-gray-700 shadow-md",
              pdfDoc ? "p-0" : "p-8 sm:p-10"
            )}
          >
            {pdfStatus === "loading" && (
              <div className="flex min-h-[900px] flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Loading document…</span>
              </div>
            )}

            {pdfStatus === "error" && (
              <div className="flex min-h-[900px] flex-col items-center justify-center gap-2 px-8 text-center text-gray-400">
                <span className="text-sm">The document could not be rendered. Please try uploading it again.</span>
              </div>
            )}

            {pdfDoc && pdfStatus === "ready" && <PdfPageCanvas pdfDoc={pdfDoc} pageNumber={currentPage} targetWidth={560} />}

            {!pdfDoc && pdfStatus !== "loading" && (
              <div className="flex min-h-[900px] items-center justify-center px-8 text-center text-gray-500">
                <p>Upload a document to preview it here.</p>
              </div>
            )}

            {placed && (
              <DraggableSignature signature={placed} containerRef={pageRef} onChange={setPlaced} onRemove={() => setPlaced(null)} onDragStateChange={setIsDraggingSignature} />
            )}
          </div>
        </div>

        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <div className="flex items-center gap-1 rounded-lg bg-gray-900/90 p-1.5 shadow-lg backdrop-blur">
            <ToolButton icon={FileText} active={activeTool === "view"} onClick={() => handleToolClick("view")} label="View" />
            <ToolButton icon={Type} active={activeTool === "textField"} onClick={() => handleToolClick("textField")} label="Add text" />
            <ToolButton icon={PenTool} active={activeTool === "signature"} onClick={() => handleToolClick("signature")} label="Signature" />
            <ToolButton icon={Plus} active={activeTool === "newDocument"} onClick={() => handleToolClick("newDocument")} label="New document" />
            <ToolButton icon={UserPlus} active={activeTool === "cosigner"} onClick={() => handleToolClick("cosigner")} label="Add co-signer(s)" />
            <ToolButton icon={ImageIcon} active={activeTool === "aiReview"} onClick={() => handleToolClick("aiReview")} label="AI review" />
            <ToolButton icon={Download} active={false} onClick={() => handleToolClick("download")} label="Download" />
          </div>

          {signaturePanelOpen && (
            <SignaturePanel signatures={savedSignatures} onInsert={handleInsertSignature} onDeleteSaved={handleDeleteSaved} onClose={() => setActiveTool(null)} onTabChange={setPanelTab} />
          )}

          {activeTool === "textField" && (
            <ToolInfoPopover title="Add Text" requireSignIn={false}>Click anywhere on the document to place a text field.</ToolInfoPopover>
          )}

          {activeTool === "newDocument" &&
            (isAuthenticated ? (
              <NewDocumentPanel onSelected={handleNewDocumentSelected} />
            ) : (
              <ToolInfoPopover title="New Document">to Add new document</ToolInfoPopover>
            ))}

          {activeTool === "cosigner" &&
            (isAuthenticated ? (
              <AddSignerPanel signers={signers} onAddSigner={handleAddSigner} onResend={handleResendInvite} onClose={() => setActiveTool(null)} />
            ) : (
              <ToolInfoPopover title="Add Co-Signer(s)">to Add people to sign the same document with you.</ToolInfoPopover>
            ))}

          {activeTool === "aiReview" &&
            (isAuthenticated ? (
              aiReviewStage === "confirm" ? (
                <AIReviewPanel onClose={() => setActiveTool(null)} onStart={handleStartAIReview} />
              ) : aiReviewStage === "watermark" ? (
                <ApprovalWatermark />
              ) : aiReviewStage === "chat" ? (
                <AITorneyChat onClose={handleCloseAIReview} />
              ) : (
                <ToolInfoPopover title="AI Review">Review and get recommendation about your document from our AI.</ToolInfoPopover>
              )
            ) : (
              <ToolInfoPopover title="AI Review">Review and get recommendation about your document from our AI.</ToolInfoPopover>
            ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, active, onClick, label }: { icon: typeof FileText; active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={cn("flex h-8 w-8 items-center justify-center rounded-md transition-colors", active ? "bg-brand-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white")}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

function DraggableSignature({
  signature, containerRef, onChange, onRemove, onDragStateChange,
}: {
  signature: PlacedSignature;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onChange: (sig: PlacedSignature) => void;
  onRemove: () => void;
  onDragStateChange: (dragging: boolean) => void;
}) {
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: signature.x, origY: signature.y };
    onDragStateChange(true);
  }, [signature.x, signature.y, onDragStateChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const nextX = Math.min(Math.max(dragState.current.origX + dx, 0), bounds.width - 120);
    const nextY = Math.min(Math.max(dragState.current.origY + dy, 0), bounds.height - 60);
    onChange({ ...signature, x: nextX, y: nextY });
  }, [containerRef, onChange, signature]);

  function handlePointerUp() {
    dragState.current = null;
    onDragStateChange(false);
  }

  return (
    <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
      style={{ left: signature.x, top: signature.y }}
      className="group absolute flex h-14 w-32 cursor-move items-center justify-center rounded-md border-2 border-dashed border-brand-400 bg-brand-50/70 px-2">
      {signature.kind === "type" ? (
        <span className="font-script text-xl text-gray-900">{signature.dataUrl}</span>
      ) : (
        <img src={signature.dataUrl} alt="Your signature" className="max-h-full max-w-full object-contain" />
      )}
      <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={onRemove}
        className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-gray-400 shadow ring-1 ring-gray-200 hover:text-red-500 group-hover:flex" aria-label="Remove signature">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function getBreadcrumb({ isDragging, activeTool, panelTab, hasSignature, isAuthenticated, aiReviewStage }: {
  isDragging: boolean; activeTool: ToolId | null; panelTab: string; hasSignature: boolean; isAuthenticated: boolean; aiReviewStage: "confirm" | "watermark" | "chat";
}) {
  if (isDragging) return "Drag Signature";

  if (activeTool === "signature") {
    if (isAuthenticated) return "Document > Sign";
    if (panelTab === "history") return `Document > Tool box > ${hasSignature ? "use signature" : "no signature"}`;
    if (panelTab === "draw") return "Document > Tool box > create Signature";
    if (panelTab === "type") return "Document > Tool box > Type in name";
    if (panelTab === "upload") return "Document > Tool box > upload signature";
  }

  if (activeTool === "newDocument") return isAuthenticated ? "Document > New Document" : "Document > Panel";
  if (activeTool === "cosigner") return isAuthenticated ? "Document > Add Signer" : "Document > Panel";
  if (activeTool === "aiReview") {
    if (!isAuthenticated) return "Document > Panel";
    return aiReviewStage === "confirm" ? "Document > AI Review" : "Document > AI Review > Approved";
  }
}