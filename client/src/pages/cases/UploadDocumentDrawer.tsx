import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadCaseDocument } from "../../api/caseDocuments";

interface UploadDocumentDrawerProps {
  caseId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: () => Promise<void> | void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const PDF_TYPE = "application/pdf";

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function UploadDocumentDrawer({
  caseId,
  open,
  onClose,
  onUploaded,
}: UploadDocumentDrawerProps) {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function resetForm() {
    setTitle("");
    setDocumentType("");
    setFile(null);
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== PDF_TYPE && selectedFile.type !== DOCX_TYPE) {
      toast.error("Only PDF and DOCX files are allowed.");

      event.target.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("Document must be 25 MB or smaller.");

      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 2 || documentType.trim().length < 2) {
      toast.error("Title and document type are required.");
      return;
    }

    if (!file) {
      toast.error("Select a document to upload.");
      return;
    }

    try {
      setIsSubmitting(true);

      await uploadCaseDocument({
        caseId,
        title: title.trim(),
        documentType: documentType.trim(),
        file,
      });

      toast.success("Document uploaded successfully.");

      resetForm();
      onClose();

      await onUploaded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload document.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-[#101828]/25"
        aria-label="Close upload document"
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#E4E7EC] bg-white sm:max-w-[430px]">
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-[#E7E9EE] px-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[#172033]">
              Upload Document
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8B94A4]">
              Add a document to this case.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center text-[#667085] hover:bg-[#F5F6F8]"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {/* TITLE */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Document Title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Incident Report"
                maxLength={250}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Document Type
              </label>

              <input
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                placeholder="Evidence"
                maxLength={100}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* FILE */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                File
              </label>

              <label className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#CDD3DD] bg-[#FAFBFC] px-5 text-center transition-colors hover:border-[#98A2B3]">
                <Upload size={18} className="text-[#667085]" />

                <p className="mt-2 text-[11.5px] font-medium text-[#475467]">
                  Select PDF or DOCX
                </p>

                <p className="mt-1 text-[10.5px] text-[#98A2B3]">
                  Maximum file size 25 MB
                </p>

                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* SELECTED FILE */}
            {file && (
              <div className="flex items-center gap-3 border border-[#E4E7EC] bg-white px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                  <FileText size={14} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-medium text-[#344054]">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#98A2B3]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-5 py-3.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-9 border border-[#DDE1E8] bg-white px-4 text-[12px] font-medium text-[#475467]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 bg-[#17223B] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#243250] disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
