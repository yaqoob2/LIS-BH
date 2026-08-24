import {
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheck,
  Clock3,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApiError } from "../../api/client";
import { getClient } from "../../api/clients";
import {
  getFeeMilestones,
  saveFeeMilestones,
  suggestFeeMilestones,
  updateFeeMilestoneStatus,
} from "../../api/feeMilestones";

import type { CaseRecord } from "../../types/case";
import type { ClientWithCases } from "../../types/client";
import type {
  FeeMilestone,
  FeeMilestoneStatus,
  SaveFeeMilestoneItem,
} from "../../types/feeMilestone";

interface CaseFeesProgressTabProps {
  caseRecord: CaseRecord;
}

interface EditableMilestone {
  key: string;
  title: string;
  description: string;
  amount: string;
}

const statusLabels: Record<FeeMilestoneStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

function formatMoney(value: string | number, currency = "BHD") {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return `${currency} 0.000`;
  }

  return `${currency} ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}`;
}

function toMinorUnits(value: string) {
  const clean = value.trim();

  if (!/^\d+(\.\d{1,3})?$/.test(clean)) {
    return null;
  }

  const [whole, decimals = ""] = clean.split(".");
  const paddedDecimals = decimals.padEnd(3, "0");

  return Number(whole) * 1000 + Number(paddedDecimals);
}

function createEditorKey() {
  return `milestone-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function milestoneStatusClass(status: FeeMilestoneStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-[#D9E2DD] bg-[#F7F9F8] text-[#52695D]";

    case "IN_PROGRESS":
      return "border-[#DCE2EA] bg-[#F7F8FA] text-[#53627E]";

    case "PENDING":
      return "border-[#E4E7EC] bg-[#FAFAFB] text-[#7B8494]";
  }
}

function StatusIcon({ status }: { status: FeeMilestoneStatus }) {
  if (status === "COMPLETED") {
    return <CircleCheck size={17} className="text-[#52695D]" />;
  }

  if (status === "IN_PROGRESS") {
    return <Clock3 size={17} className="text-[#53627E]" />;
  }

  return <Circle size={17} className="text-[#A3AAB7]" />;
}

export default function CaseFeesProgressTab({
  caseRecord,
}: CaseFeesProgressTabProps) {
  const [milestones, setMilestones] = useState<FeeMilestone[]>([]);

  const [clientDetails, setClientDetails] = useState<ClientWithCases | null>(
    null,
  );

  const [editorMilestones, setEditorMilestones] = useState<EditableMilestone[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(
    null,
  );

  const [editorMode, setEditorMode] = useState<"AI" | "MANUAL" | null>(null);

  const loadMilestones = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await getFeeMilestones(caseRecord.id);

      setMilestones([...data].sort((a, b) => a.sequence - b.sequence));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load fee milestones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseRecord.id]);

  useEffect(() => {
    void loadMilestones();
  }, [loadMilestones]);

  useEffect(() => {
    let cancelled = false;

    async function loadClientDetails() {
      if (!caseRecord.clientId) {
        setClientDetails(null);
        return;
      }

      try {
        const data = await getClient(caseRecord.clientId);

        if (!cancelled) {
          setClientDetails(data);
        }
      } catch {
        if (!cancelled) {
          setClientDetails(null);
        }
      }
    }

    void loadClientDetails();

    return () => {
      cancelled = true;
    };
  }, [caseRecord.clientId]);

  const completedCount = useMemo(
    () => milestones.filter((item) => item.status === "COMPLETED").length,
    [milestones],
  );

  const progressPercentage = useMemo(() => {
    if (milestones.length === 0) {
      return 0;
    }

    return Math.round((completedCount / milestones.length) * 100);
  }, [completedCount, milestones.length]);

  const caseFeeMinorUnits = useMemo(() => {
    if (!caseRecord.totalFee) {
      return null;
    }

    return toMinorUnits(caseRecord.totalFee);
  }, [caseRecord.totalFee]);

  const editorTotalMinorUnits = useMemo(() => {
    let total = 0;

    for (const milestone of editorMilestones) {
      const amount = toMinorUnits(milestone.amount);

      if (amount === null) {
        return null;
      }

      total += amount;
    }

    return total;
  }, [editorMilestones]);

  const editorTotalMatches =
    caseFeeMinorUnits !== null &&
    editorTotalMinorUnits !== null &&
    caseFeeMinorUnits === editorTotalMinorUnits;

  function startManualEditor() {
    if (!caseRecord.totalFee) {
      toast.error("Set the professional fee before creating milestones.");
      return;
    }

    setEditorMode("MANUAL");

    setEditorMilestones([
      {
        key: createEditorKey(),
        title: "",
        description: "",
        amount: "",
      },
    ]);
  }

  async function handleGenerate() {
    if (!caseRecord.totalFee) {
      toast.error("Set the professional fee before generating milestones.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await suggestFeeMilestones(caseRecord.id);

      setEditorMilestones(
        response.milestones.map((item) => ({
          key: createEditorKey(),
          title: item.title,
          description: item.description ?? "",
          amount: item.amount,
        })),
      );

      setEditorMode("AI");

      toast.success("Milestones generated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not generate milestones. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function updateEditorMilestone(
    key: string,
    field: "title" | "description" | "amount",
    value: string,
  ) {
    setEditorMilestones((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addEditorMilestone() {
    if (editorMilestones.length >= 10) {
      toast.error("A maximum of 10 milestones is supported.");
      return;
    }

    setEditorMilestones((current) => [
      ...current,
      {
        key: createEditorKey(),
        title: "",
        description: "",
        amount: "",
      },
    ]);
  }

  function removeEditorMilestone(key: string) {
    if (editorMilestones.length <= 1) {
      toast.error("At least one milestone is required.");
      return;
    }

    setEditorMilestones((current) =>
      current.filter((item) => item.key !== key),
    );
  }

  function moveEditorMilestone(index: number, direction: "UP" | "DOWN") {
    setEditorMilestones((current) => {
      const targetIndex = direction === "UP" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];

      const [moved] = next.splice(index, 1);

      next.splice(targetIndex, 0, moved);

      return next;
    });
  }

  async function handleSaveMilestones() {
    if (!caseRecord.totalFee) {
      return;
    }

    if (editorMilestones.length < 1 || editorMilestones.length > 10) {
      toast.error("Create between 1 and 10 milestones.");
      return;
    }

    for (const milestone of editorMilestones) {
      if (!milestone.title.trim()) {
        toast.error("Every milestone requires a title.");
        return;
      }

      if (toMinorUnits(milestone.amount) === null) {
        toast.error("Enter a valid amount with up to 3 decimal places.");
        return;
      }
    }

    if (!editorTotalMatches) {
      toast.error("Milestone amounts must equal the agreed professional fee.");
      return;
    }

    const payload: {
      milestones: SaveFeeMilestoneItem[];
    } = {
      milestones: editorMilestones.map((item) => ({
        title: item.title.trim(),

        ...(item.description.trim()
          ? {
              description: item.description.trim(),
            }
          : {}),

        amount: item.amount.trim(),
      })),
    };

    try {
      setIsSaving(true);

      const saved = await saveFeeMilestones(caseRecord.id, payload);

      setMilestones([...saved].sort((a, b) => a.sequence - b.sequence));

      setEditorMilestones([]);
      setEditorMode(null);

      toast.success("Fee milestones approved.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Fee milestones have already been approved for this case.");

        setEditorMode(null);
        setEditorMilestones([]);

        await loadMilestones();

        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save fee milestones.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(
    milestone: FeeMilestone,
    status: FeeMilestoneStatus,
  ) {
    if (milestone.status === status) {
      return;
    }

    try {
      setUpdatingMilestoneId(milestone.id);

      const updated = await updateFeeMilestoneStatus(milestone.id, status);

      setMilestones((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      toast.success("Milestone updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update milestone.",
      );
    } finally {
      setUpdatingMilestoneId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-4 flex min-h-[240px] items-center justify-center border border-[#E4E7EC] bg-white">
        <div className="flex items-center gap-2 text-[11.5px] text-[#7B8494]">
          <LoaderCircle size={14} className="animate-spin" />
          Loading fee progress...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* SUMMARY */}
      <section className="border border-[#E4E7EC] bg-white">
        <div className="grid gap-px bg-[#E7E9EE] sm:grid-cols-3">
          {/* CLIENT */}
          <div className="bg-white px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
              Client
            </p>

            {caseRecord.client ? (
              <div className="mt-1.5 flex min-w-0 items-center gap-2">
                <UserRound size={13} className="shrink-0 text-[#98A2B3]" />

                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[12px] font-semibold text-[#344054]">
                    {caseRecord.client.name}
                  </p>

                  <span className="text-[9px] text-[#C4C9D2]">•</span>

                  <p className="text-[12px] font-semibold text-[#344054]">
                    {caseRecord.client.whatsappNumber}
                  </p>

                  {clientDetails && (
                    <>
                      <span className="text-[9px] text-[#C4C9D2]">•</span>

                      <p className="text-[12px] font-semibold text-[#344054]">
                        {clientDetails.identityType === "PASSPORT"
                          ? "Passport"
                          : "CPR"}{" "}
                        {clientDetails.identityNumberMasked}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-1.5 text-[12px] text-[#98A2B3]">
                No client linked
              </p>
            )}
          </div>

          {/* FEE */}
          <div className="bg-white px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
              Professional Fee
            </p>

            <p className="mt-1.5 text-[12px] font-semibold text-[#344054]">
              {caseRecord.totalFee
                ? formatMoney(caseRecord.totalFee, caseRecord.currency)
                : "—"}
            </p>
          </div>

          {/* PROGRESS */}
          <div className="bg-white px-4 py-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                Progress
              </p>

              <span className="text-[11px] font-semibold text-[#53627E]">
                {progressPercentage}%
              </span>
            </div>

            <div className="mt-2 h-[4px] overflow-hidden bg-[#EEF0F3]">
              <div
                className="h-full bg-[#53627E] transition-[width]"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            {milestones.length > 0 && (
              <p className="mt-1.5 text-[9.5px] text-[#98A2B3]">
                {completedCount} of {milestones.length} completed
              </p>
            )}
          </div>
        </div>
      </section>

      {/* NO MILESTONES */}
      {milestones.length === 0 && editorMode === null && (
        <section className="mt-3 flex min-h-[230px] flex-col items-center justify-center border border-[#E4E7EC] bg-white px-5 text-center">
          <div className="flex h-9 w-9 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
            <Sparkles size={15} />
          </div>

          <p className="mt-3 text-[12.5px] font-medium text-[#344054]">
            No fee milestones yet
          </p>

          <p className="mt-1 max-w-[420px] text-[10.5px] leading-5 text-[#98A2B3]">
            Create the professional fee stages that will be shared with the
            client.
          </p>

          {!caseRecord.totalFee ? (
            <p className="mt-4 border border-[#E5E0D4] bg-[#FAF9F6] px-3 py-2 text-[10.5px] text-[#756647]">
              Set the professional fee before creating milestones.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating}
                className="inline-flex h-9 items-center justify-center gap-2 bg-[#17223B] px-3.5 text-[11px] font-medium text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}

                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>

              <button
                type="button"
                onClick={startManualEditor}
                className="inline-flex h-9 items-center justify-center gap-2 border border-[#DDE1E8] bg-white px-3.5 text-[11px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB]"
              >
                <Plus size={13} />
                Create Manually
              </button>
            </div>
          )}
        </section>
      )}

      {/* EDITOR */}
      {editorMode !== null && milestones.length === 0 && (
        <section className="mt-3 border border-[#E4E7EC] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#E7E9EE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[12.5px] font-semibold text-[#273449]">
                {editorMode === "AI"
                  ? "Review Fee Milestones"
                  : "Create Fee Milestones"}
              </h2>

              <p className="mt-0.5 text-[10px] text-[#98A2B3]">
                Review the stages before approval. The total must equal the
                professional fee.
              </p>
            </div>

            <button
              type="button"
              onClick={addEditorMilestone}
              className="inline-flex h-8 items-center justify-center gap-1.5 self-start border border-[#DDE1E8] bg-white px-3 text-[10.5px] font-medium text-[#475467] hover:bg-[#F8F9FB] sm:self-auto"
            >
              <Plus size={12} />
              Add Milestone
            </button>
          </div>

          <div className="divide-y divide-[#EEF0F3]">
            {editorMilestones.map((item, index) => (
              <div key={item.key} className="px-4 py-4">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#FAFAFB] text-[10.5px] font-semibold text-[#53627E]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="grid gap-3 lg:grid-cols-[1fr_170px]">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-[#7B8494]">
                          Milestone Title
                        </label>

                        <input
                          value={item.title}
                          onChange={(event) =>
                            updateEditorMilestone(
                              item.key,
                              "title",
                              event.target.value,
                            )
                          }
                          maxLength={250}
                          placeholder="Initial Case Review"
                          className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[11.5px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-[#7B8494]">
                          Amount
                        </label>

                        <div className="flex">
                          <div className="flex h-9 shrink-0 items-center border border-r-0 border-[#DDE1E8] bg-[#FAFAFB] px-2.5 text-[9.5px] font-medium text-[#667085]">
                            {caseRecord.currency}
                          </div>

                          <input
                            value={item.amount}
                            inputMode="decimal"
                            onChange={(event) => {
                              const value = event.target.value;

                              if (
                                value === "" ||
                                /^\d*(\.\d{0,3})?$/.test(value)
                              ) {
                                updateEditorMilestone(
                                  item.key,
                                  "amount",
                                  value,
                                );
                              }
                            }}
                            placeholder="0.000"
                            className="h-9 min-w-0 flex-1 border border-[#DDE1E8] bg-white px-2.5 text-[11.5px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="mb-1 block text-[10px] font-medium text-[#7B8494]">
                        Description
                      </label>

                      <textarea
                        value={item.description}
                        onChange={(event) =>
                          updateEditorMilestone(
                            item.key,
                            "description",
                            event.target.value,
                          )
                        }
                        rows={2}
                        placeholder="Optional short description..."
                        className="w-full resize-none border border-[#DDE1E8] bg-white px-3 py-2 text-[11px] leading-5 text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      onClick={() => moveEditorMilestone(index, "UP")}
                      disabled={index === 0}
                      className="flex h-7 w-7 items-center justify-center text-[#98A2B3] hover:bg-[#F5F6F8] hover:text-[#475467] disabled:opacity-25"
                      title="Move up"
                    >
                      <ChevronUp size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveEditorMilestone(index, "DOWN")}
                      disabled={index === editorMilestones.length - 1}
                      className="flex h-7 w-7 items-center justify-center text-[#98A2B3] hover:bg-[#F5F6F8] hover:text-[#475467] disabled:opacity-25"
                      title="Move down"
                    >
                      <ChevronDown size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeEditorMilestone(item.key)}
                      className="flex h-7 w-7 items-center justify-center text-[#A16A6A] hover:bg-[#FBF7F7]"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="border-t border-[#E7E9EE] bg-[#FAFAFB] px-4 py-3">
            <div className="ml-auto max-w-[360px] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#7B8494]">Milestone Total</span>

                <span
                  className={
                    editorTotalMatches
                      ? "font-semibold text-[#52695D]"
                      : "font-semibold text-[#934B4B]"
                  }
                >
                  {formatMoney(
                    (editorTotalMinorUnits ?? 0) / 1000,
                    caseRecord.currency,
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#7B8494]">Case Fee</span>

                <span className="font-semibold text-[#344054]">
                  {formatMoney(caseRecord.totalFee ?? 0, caseRecord.currency)}
                </span>
              </div>

              {!editorTotalMatches && (
                <p className="pt-1 text-[10px] text-[#934B4B]">
                  Milestone amounts must equal the agreed professional fee.
                </p>
              )}
            </div>
          </div>

          {/* EDITOR ACTIONS */}
          <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-4 py-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setEditorMode(null);
                setEditorMilestones([]);
              }}
              className="h-8 border border-[#DDE1E8] bg-white px-3.5 text-[11px] font-medium text-[#475467] hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving || !editorTotalMatches}
              onClick={() => void handleSaveMilestones()}
              className="h-8 bg-[#17223B] px-3.5 text-[11px] font-medium text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving..." : "Approve Milestones"}
            </button>
          </div>
        </section>
      )}

      {/* SAVED TIMELINE */}
      {milestones.length > 0 && (
        <section className="mt-3 border border-[#E4E7EC] bg-white">
          <div className="border-b border-[#E7E9EE] px-4 py-3">
            <h2 className="text-[12.5px] font-semibold text-[#273449]">
              Fee Milestones
            </h2>

            <p className="mt-0.5 text-[10px] text-[#98A2B3]">
              Update progress as work moves through each agreed stage.
            </p>
          </div>

          <div className="px-4 py-2">
            {milestones.map((milestone, index) => {
              const isUpdating = updatingMilestoneId === milestone.id;

              return (
                <div key={milestone.id} className="relative flex gap-3 py-4">
                  {index < milestones.length - 1 && (
                    <div className="absolute bottom-0 left-[8px] top-[35px] w-px bg-[#E4E7EC]" />
                  )}

                  <div className="relative z-[1] mt-0.5 shrink-0 bg-white">
                    <StatusIcon status={milestone.status} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-semibold text-[#344054]">
                            {milestone.sequence}. {milestone.title}
                          </p>

                          <span
                            className={`border px-1.5 py-[2px] text-[9.5px] font-medium ${milestoneStatusClass(
                              milestone.status,
                            )}`}
                          >
                            {statusLabels[milestone.status]}
                          </span>
                        </div>

                        {milestone.description && (
                          <p className="mt-1 max-w-[720px] text-[10.5px] leading-5 text-[#7B8494]">
                            {milestone.description}
                          </p>
                        )}

                        <p className="mt-1.5 text-[11px] font-medium text-[#53627E]">
                          {formatMoney(milestone.amount, caseRecord.currency)}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <select
                          value={milestone.status}
                          disabled={isUpdating}
                          onChange={(event) =>
                            void handleStatusChange(
                              milestone,
                              event.target.value as FeeMilestoneStatus,
                            )
                          }
                          className="h-8 border border-[#DDE1E8] bg-white px-2.5 text-[10.5px] text-[#475467] outline-none focus:border-[#667694] disabled:bg-[#F7F8FA]"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>

                    {milestone.completedAt && (
                      <p className="mt-1.5 text-[9.5px] text-[#98A2B3]">
                        Completed{" "}
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(milestone.completedAt))}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
