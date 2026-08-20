import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { createDeadline } from "../../api/deadlines";
import type { DeadlineStatus } from "../../types/deadline";

interface AddDeadlineDrawerProps {
  caseId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}

export default function AddDeadlineDrawer({
  caseId,
  open,
  onClose,
  onCreated,
}: AddDeadlineDrawerProps) {
  const [title, setTitle] = useState("");
  const [deadlineType, setDeadlineType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<DeadlineStatus>("OPEN");

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
    setDeadlineType("");
    setDueDate("");
    setStatus("OPEN");
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length < 2 || deadlineType.trim().length < 2 || !dueDate) {
      toast.error("Title, deadline type and due date are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createDeadline({
        caseId,
        title: title.trim(),
        deadlineType: deadlineType.trim(),
        dueDate: new Date(dueDate).toISOString(),
        status,
      });

      toast.success("Deadline created successfully.");

      resetForm();
      onClose();

      await onCreated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create deadline.",
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
        aria-label="Close add deadline"
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#E4E7EC] bg-white sm:max-w-[430px]">
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-[#E7E9EE] px-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[#172033]">
              Add Deadline
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8B94A4]">
              Add an important date for this case.
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
                Deadline Title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Submit response to court"
                maxLength={250}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Deadline Type
              </label>

              <input
                value={deadlineType}
                onChange={(event) => setDeadlineType(event.target.value)}
                placeholder="Court Filing"
                maxLength={100}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>

            {/* DUE DATE */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Due Date & Time
              </label>

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none focus:border-[#667694]"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as DeadlineStatus)
                }
                className="h-9 w-full border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#18212F] outline-none focus:border-[#667694]"
              >
                <option value="OPEN">Open</option>

                <option value="COMPLETED">Completed</option>

                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
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
              {isSubmitting ? "Creating..." : "Add Deadline"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
