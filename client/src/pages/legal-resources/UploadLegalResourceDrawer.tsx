import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadLegalResource } from "../../api/legalResources";

interface UploadLegalResourceDrawerProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => Promise<void> | void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function UploadLegalResourceDrawer({
  open,
  onClose,
  onUploaded,
}: UploadLegalResourceDrawerProps) {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");

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
    setCategory("");
    setLanguage("");
    setReferenceNumber("");
    setYear("");
    setNotes("");
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

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");

      event.target.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("PDF must be 25 MB or smaller.");

      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      title.trim().length < 2 ||
      documentType.trim().length < 2 ||
      category.trim().length < 2 ||
      language.trim().length < 2
    ) {
      toast.error("Title, document type, category and language are required.");
      return;
    }

    if (!file) {
      toast.error("Select a legal resource PDF.");
      return;
    }

    if (year && Number(year) < 1800) {
      toast.error("Enter a valid year.");
      return;
    }

    try {
      setIsSubmitting(true);

      await uploadLegalResource({
        title: title.trim(),
        documentType: documentType.trim(),
        category: category.trim(),
        language: language.trim(),

        ...(referenceNumber.trim()
          ? {
              referenceNumber: referenceNumber.trim(),
            }
          : {}),

        ...(year
          ? {
              year: Number(year),
            }
          : {}),

        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),

        file,
      });

      toast.success("Legal resource uploaded successfully.");

      resetForm();
      onClose();

      await onUploaded();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload legal resource.",
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
        aria-label="Close upload legal resource"
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#E4E7EC] bg-white sm:max-w-[460px]">
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-[#E7E9EE] px-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[#172033]">
              Upload Legal Resource
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8B94A4]">
              Add an official legal PDF to the knowledge base.
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
                Title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Bahrain Labour Law"
                maxLength={250}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* TYPE + CATEGORY */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                  Document Type
                </label>

                <input
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  placeholder="Law"
                  maxLength={100}
                  className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Labour"
                  maxLength={100}
                  className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>
            </div>

            {/* LANGUAGE + YEAR */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                  Language
                </label>

                <input
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  placeholder="Arabic"
                  maxLength={50}
                  className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                  Year
                </label>

                <input
                  type="number"
                  min="1800"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  placeholder="2012"
                  className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>
            </div>

            {/* REFERENCE */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Reference Number
              </label>

              <input
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
                placeholder="Law No. 36 of 2012"
                maxLength={150}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* NOTES */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes..."
                maxLength={2000}
                rows={3}
                className="w-full resize-none border border-[#DDE1E8] px-3 py-2.5 text-[12px] leading-5 outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* PDF */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Legal PDF
              </label>

              <label className="flex min-h-[105px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#CDD3DD] bg-[#FAFBFC] px-5 text-center hover:border-[#98A2B3]">
                <Upload size={18} className="text-[#667085]" />

                <p className="mt-2 text-[11.5px] font-medium text-[#475467]">
                  Select PDF
                </p>

                <p className="mt-1 text-[10.5px] text-[#98A2B3]">
                  Maximum file size 25 MB
                </p>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-3 border border-[#E4E7EC] px-3 py-2.5">
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
              className="h-9 bg-[#17223B] px-4 text-[12px] font-medium text-white hover:bg-[#243250] disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Upload Resource"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
