import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteDeadline,
  getCaseDeadlines,
  updateDeadline,
} from "../../api/deadlines";

import type { Deadline, DeadlineStatus } from "../../types/deadline";

import AddDeadlineDrawer from "./AddDeadlineDrawer";

interface CaseDeadlinesTabProps {
  caseId: string;
}

const statusLabels: Record<DeadlineStatus, string> = {
  OPEN: "Open",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function statusClass(status: DeadlineStatus) {
  switch (status) {
    case "OPEN":
      return "border-[#DCE2EA] bg-[#F7F8FA] text-[#53627E]";

    case "COMPLETED":
      return "border-[#D9E2DD] bg-[#F7F9F8] text-[#52695D]";

    case "CANCELLED":
      return "border-[#E1E4E8] bg-[#F8F8F9] text-[#667085]";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CaseDeadlinesTab({ caseId }: CaseDeadlinesTabProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deadlineToDelete, setDeadlineToDelete] = useState<Deadline | null>(
    null,
  );

  const loadDeadlines = useCallback(async () => {
    try {
      const data = await getCaseDeadlines(caseId);

      setDeadlines(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load deadlines.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadDeadlines();
  }, [loadDeadlines]);

  async function handleComplete(deadline: Deadline) {
    try {
      setUpdatingId(deadline.id);

      await updateDeadline(deadline.id, {
        status: "COMPLETED",
      });

      toast.success("Deadline marked as completed.");

      await loadDeadlines();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update deadline.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function requestDelete(deadline: Deadline) {
    setDeadlineToDelete(deadline);
  }

  function cancelDelete() {
    if (deletingId) return;

    setDeadlineToDelete(null);
  }

  async function confirmDelete() {
    if (!deadlineToDelete) return;

    try {
      setDeletingId(deadlineToDelete.id);

      await deleteDeadline(deadlineToDelete.id);

      toast.success("Deadline deleted successfully.");

      setDeadlineToDelete(null);

      await loadDeadlines();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete deadline.",
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
              Deadlines
            </h2>

            <p className="mt-0.5 text-[10.5px] text-[#98A2B3]">
              Important dates and required actions for this case.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 bg-[#17223B] px-3 text-[11.5px] font-medium text-white transition-colors hover:bg-[#243250]"
          >
            <Plus size={13} />
            Add Deadline
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 animate-pulse bg-[#F1F3F5]" />
            ))}
          </div>
        ) : deadlines.length === 0 ? (
          /* EMPTY */
          <div className="flex min-h-[190px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#667085]">
              <CalendarDays size={16} />
            </div>

            <p className="mt-3 text-[12px] font-medium text-[#344054]">
              No deadlines added
            </p>

            <p className="mt-1 text-[10.5px] text-[#98A2B3]">
              Add important dates and case deadlines here.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E7E9EE] bg-[#FAFAFB]">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Deadline
                    </th>

                    <th className="w-[180px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Type
                    </th>

                    <th className="w-[190px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Due
                    </th>

                    <th className="w-[130px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Status
                    </th>

                    <th className="w-[150px] px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deadlines.map((deadline) => (
                    <tr
                      key={deadline.id}
                      className="border-b border-[#EEF0F3] last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <p className="max-w-[370px] truncate text-[12px] font-medium text-[#273449]">
                          {deadline.title}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-[11.5px] text-[#667085]">
                        {deadline.deadlineType}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={12} className="text-[#98A2B3]" />

                          <span className="text-[11px] text-[#667085]">
                            {formatDate(deadline.dueDate)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex border px-1.5 py-[2px] text-[10px] font-medium ${statusClass(
                            deadline.status,
                          )}`}
                        >
                          {statusLabels[deadline.status]}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {deadline.status === "OPEN" && (
                            <button
                              type="button"
                              onClick={() => void handleComplete(deadline)}
                              disabled={updatingId === deadline.id}
                              title="Mark completed"
                              className="flex h-8 items-center gap-1.5 px-2 text-[10.5px] font-medium text-[#53627E] hover:bg-[#F5F6F8] disabled:opacity-50"
                            >
                              <Check size={12} />
                              Complete
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => requestDelete(deadline)}
                            title="Delete deadline"
                            className="flex h-8 w-8 items-center justify-center text-[#98A2B3] hover:bg-[#FBF5F5] hover:text-[#9B4444]"
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
              {deadlines.map((deadline) => (
                <div key={deadline.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-[#273449]">
                        {deadline.title}
                      </p>

                      <p className="mt-1 text-[10.5px] text-[#667085]">
                        {deadline.deadlineType}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-1.5 py-[2px] text-[9.5px] font-medium ${statusClass(
                        deadline.status,
                      )}`}
                    >
                      {statusLabels[deadline.status]}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#7B8494]">
                      <CalendarDays size={11} />

                      {formatDate(deadline.dueDate)}
                    </div>

                    <div className="flex items-center gap-1">
                      {deadline.status === "OPEN" && (
                        <button
                          type="button"
                          onClick={() => void handleComplete(deadline)}
                          className="flex h-8 items-center gap-1 px-2 text-[10px] font-medium text-[#53627E]"
                        >
                          <Check size={12} />
                          Complete
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => requestDelete(deadline)}
                        className="flex h-8 w-8 items-center justify-center text-[#98A2B3]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ADD DEADLINE */}
      <AddDeadlineDrawer
        caseId={caseId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={loadDeadlines}
      />

      {/* DELETE CONFIRMATION */}
      {deadlineToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/25 px-4">
          <div className="w-full max-w-[340px] border border-[#DDE1E8] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
            <div className="px-5 py-4">
              <h3 className="text-[14px] font-semibold text-[#172033]">
                Delete deadline?
              </h3>

              <p className="mt-2 text-[11.5px] leading-5 text-[#667085]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[#344054]">
                  "{deadlineToDelete.title}"
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-5 py-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deletingId !== null}
                className="h-8 min-w-[64px] border border-[#DDE1E8] bg-white px-3 text-[11.5px] font-medium text-[#475467] hover:bg-[#F8F9FB]"
              >
                No
              </button>

              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deletingId !== null}
                className="h-8 min-w-[64px] bg-[#17223B] px-3 text-[11.5px] font-medium text-white hover:bg-[#243250] disabled:opacity-50"
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
