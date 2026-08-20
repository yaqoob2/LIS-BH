import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteCaseDocument,
  downloadCaseDocument,
  getCaseDocuments,
  processCaseDocument,
} from "../../api/caseDocuments";

import type {
  CaseDocument,
  DocumentProcessingStatus,
} from "../../types/caseDocument";

import UploadDocumentDrawer from "./UploadDocumentDrawer";

interface CaseDocumentsTabProps {
  caseId: string;
}

const statusLabels: Record<DocumentProcessingStatus, string> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
};

function statusClass(status: DocumentProcessingStatus) {
  switch (status) {
    case "UPLOADED":
      return "border-[#DCE2EA] bg-[#F7F8FA] text-[#53627E]";

    case "PROCESSING":
      return "border-[#E5E0D4] bg-[#FAF9F6] text-[#756647]";

    case "READY":
      return "border-[#D9E2DD] bg-[#F7F9F8] text-[#52695D]";

    case "FAILED":
      return "border-[#E7DADA] bg-[#FBF7F7] text-[#934B4B]";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CaseDocumentsTab({ caseId }: CaseDocumentsTabProps) {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [documentToDelete, setDocumentToDelete] = useState<CaseDocument | null>(
    null,
  );

  const loadDocuments = useCallback(async () => {
    try {
      const data = await getCaseDocuments(caseId);

      setDocuments(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load documents.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function handleProcess(document: CaseDocument) {
    try {
      setProcessingId(document.id);

      await processCaseDocument(document.id);

      toast.success("Document processed successfully.");

      await loadDocuments();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to process document.",
      );

      await loadDocuments();
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDownload(document: CaseDocument) {
    try {
      setDownloadingId(document.id);

      await downloadCaseDocument(document);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to download document.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  function requestDelete(document: CaseDocument) {
    setDocumentToDelete(document);
  }

  function cancelDelete() {
    if (deletingId) return;

    setDocumentToDelete(null);
  }

  async function confirmDelete() {
    if (!documentToDelete) return;

    try {
      setDeletingId(documentToDelete.id);

      await deleteCaseDocument(documentToDelete.id);

      toast.success("Document deleted successfully.");

      setDocumentToDelete(null);

      await loadDocuments();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete document.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="mt-4 border border-[#E4E7EC] bg-white">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
          <div>
            <h2 className="text-[12.5px] font-semibold text-[#273449]">
              Documents
            </h2>

            <p className="mt-0.5 text-[10.5px] text-[#98A2B3]">
              Documents and evidence stored for this case.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 bg-[#17223B] px-3 text-[11.5px] font-medium text-white transition-colors hover:bg-[#243250]"
          >
            <Plus size={13} />
            Upload
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 animate-pulse bg-[#F1F3F5]" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[190px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#667085]">
              <FileText size={16} />
            </div>

            <p className="mt-3 text-[12px] font-medium text-[#344054]">
              No documents uploaded
            </p>

            <p className="mt-1 text-[10.5px] text-[#98A2B3]">
              Upload PDF or DOCX files related to this case.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E7E9EE] bg-[#FAFAFB]">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Document
                    </th>

                    <th className="w-[160px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Type
                    </th>

                    <th className="w-[130px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Status
                    </th>

                    <th className="w-[130px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Added
                    </th>

                    <th className="w-[190px] px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      className="border-b border-[#EEF0F3] last:border-b-0"
                    >
                      {/* DOCUMENT */}
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                            <FileText size={14} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[350px] truncate text-[12px] font-medium text-[#273449]">
                              {document.title}
                            </p>

                            <p className="mt-0.5 text-[10px] uppercase text-[#98A2B3]">
                              {document.filePath.toLowerCase().endsWith(".pdf")
                                ? "PDF"
                                : "DOCX"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="px-4 py-3 text-[11.5px] text-[#667085]">
                        {document.documentType}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex border px-1.5 py-[2px] text-[10px] font-medium ${statusClass(
                            document.processingStatus,
                          )}`}
                        >
                          {statusLabels[document.processingStatus]}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 text-[11px] text-[#7B8494]">
                        {formatDate(document.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {(document.processingStatus === "UPLOADED" ||
                            document.processingStatus === "FAILED") && (
                            <button
                              type="button"
                              onClick={() => void handleProcess(document)}
                              disabled={processingId === document.id}
                              title="Process document"
                              className="flex h-8 items-center gap-1.5 px-2 text-[10.5px] font-medium text-[#53627E] hover:bg-[#F5F6F8] disabled:opacity-50"
                            >
                              <RefreshCw
                                size={12}
                                className={
                                  processingId === document.id
                                    ? "animate-spin"
                                    : ""
                                }
                              />
                              Process
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDownload(document)}
                            disabled={downloadingId === document.id}
                            title="Download document"
                            className="flex h-8 w-8 items-center justify-center text-[#667085] hover:bg-[#F5F6F8] hover:text-[#17223B] disabled:opacity-50"
                          >
                            <Download size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(document)}
                            disabled={deletingId === document.id}
                            title="Delete document"
                            className="flex h-8 w-8 items-center justify-center text-[#98A2B3] hover:bg-[#FBF5F5] hover:text-[#9B4444] disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-[#EEF0F3] md:hidden">
              {documents.map((document) => (
                <div key={document.id} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                      <FileText size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-medium text-[#273449]">
                            {document.title}
                          </p>

                          <p className="mt-1 text-[10.5px] text-[#667085]">
                            {document.documentType}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 border px-1.5 py-[2px] text-[9.5px] font-medium ${statusClass(
                            document.processingStatus,
                          )}`}
                        >
                          {statusLabels[document.processingStatus]}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <p className="text-[10px] text-[#98A2B3]">
                          {formatDate(document.createdAt)}
                        </p>

                        <div className="flex items-center gap-1">
                          {(document.processingStatus === "UPLOADED" ||
                            document.processingStatus === "FAILED") && (
                            <button
                              type="button"
                              onClick={() => void handleProcess(document)}
                              disabled={processingId === document.id}
                              className="flex h-8 items-center gap-1 px-2 text-[10px] font-medium text-[#53627E]"
                            >
                              <RefreshCw
                                size={12}
                                className={
                                  processingId === document.id
                                    ? "animate-spin"
                                    : ""
                                }
                              />
                              Process
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDownload(document)}
                            disabled={downloadingId === document.id}
                            className="flex h-8 w-8 items-center justify-center text-[#667085] disabled:opacity-50"
                          >
                            <Download size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(document)}
                            disabled={deletingId === document.id}
                            className="flex h-8 w-8 items-center justify-center text-[#98A2B3] disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {document.processingStatus === "FAILED" &&
                    document.processingError && (
                      <p className="mt-2 border-l-2 border-[#D8B7B7] pl-2 text-[10px] leading-4 text-[#934B4B]">
                        {document.processingError}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* UPLOAD DRAWER */}
      <UploadDocumentDrawer
        caseId={caseId}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={loadDocuments}
      />

      {/* DELETE CONFIRMATION */}
      {documentToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/25 px-4">
          <div className="w-full max-w-[340px] border border-[#DDE1E8] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
            <div className="px-5 py-4">
              <h3 className="text-[14px] font-semibold text-[#172033]">
                Delete document?
              </h3>

              <p className="mt-2 text-[11.5px] leading-5 text-[#667085]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[#344054]">
                  "{documentToDelete.title}"
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-5 py-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deletingId !== null}
                className="h-8 min-w-[64px] border border-[#DDE1E8] bg-white px-3 text-[11.5px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
              >
                No
              </button>

              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deletingId !== null}
                className="h-8 min-w-[64px] bg-[#17223B] px-3 text-[11.5px] font-medium text-white transition-colors hover:bg-[#243250] disabled:opacity-50"
              >
                {deletingId ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
