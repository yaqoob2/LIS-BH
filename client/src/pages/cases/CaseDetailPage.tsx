import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { getCase } from "../../api/cases";

import type { CasePriority, CaseRecord, CaseStatus } from "../../types/case";

import CasePartiesTab from "./CasePartiesTab";
import CaseDocumentsTab from "./CaseDocumentsTab";
import CaseDeadlinesTab from "./CaseDeadlinesTab";
import CaseFeesProgressTab from "./CaseFeesProgressTab";
import CaseAiTab from "./CaseAiTab";

const statusLabels: Record<CaseStatus, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  AWAITING_RESPONSE: "Awaiting Response",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

const priorityLabels: Record<CasePriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: string | number | null, currency = "BHD") {
  if (value === null) {
    return "—";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return `${currency} ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}`;
}

export default function CaseDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "overview" | "parties" | "documents" | "deadlines" | "fees" | "ai"
  >("overview");

  useEffect(() => {
    async function loadCase() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getCase(id);

        setCaseRecord(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load case.";

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCase();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-[#E9ECF0]" />

          <div className="mt-5 h-7 w-72 bg-[#E9ECF0]" />

          <div className="mt-3 h-4 w-40 bg-[#EEF0F3]" />

          <div className="mt-7 h-[220px] border border-[#E4E7EC] bg-white" />
        </div>
      </div>
    );
  }

  if (!caseRecord) {
    return (
      <div className="mx-auto w-full max-w-[1180px]">
        <button
          type="button"
          onClick={() => navigate("/cases")}
          className="inline-flex items-center gap-2 text-[12px] font-medium text-[#53627E]"
        >
          <ArrowLeft size={14} />
          Back to Cases
        </button>

        <div className="mt-6 border border-[#E4E7EC] bg-white p-6">
          <p className="text-[13px] font-medium text-[#344054]">
            Case could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      {/* BACK */}
      <button
        type="button"
        onClick={() => navigate("/cases")}
        className="inline-flex items-center gap-2 text-[11.5px] font-medium text-[#667085] transition-colors hover:text-[#17223B]"
      >
        <ArrowLeft size={14} />
        Cases
      </button>

      {/* HEADER */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#53627E]">
            {caseRecord.referenceNumber}
          </p>

          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
            {caseRecord.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-[#7B8494]">
            <span>{caseRecord.caseType}</span>

            {caseRecord.category && (
              <>
                <span className="text-[#C4C9D2]">•</span>

                <span>{caseRecord.category}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-[#DCE2EA] bg-[#F7F8FA] px-2 py-1 text-[10.5px] font-medium text-[#53627E]">
            {statusLabels[caseRecord.status]}
          </span>

          <span className="border border-[#E4E7EC] bg-white px-2 py-1 text-[10.5px] font-medium text-[#667085]">
            {priorityLabels[caseRecord.priority]}
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-6 overflow-x-auto border-b border-[#E4E7EC]">
        <div className="flex min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-[#233A6C] text-[#17223B]"
                : "text-[#7B8494] hover:text-[#344054]"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("parties")}
            className={`px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === "parties"
                ? "border-b-2 border-[#233A6C] text-[#17223B]"
                : "text-[#7B8494] hover:text-[#344054]"
            }`}
          >
            Parties
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === "documents"
                ? "border-b-2 border-[#233A6C] text-[#17223B]"
                : "text-[#7B8494] hover:text-[#344054]"
            }`}
          >
            Documents
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deadlines")}
            className={`px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === "deadlines"
                ? "border-b-2 border-[#233A6C] text-[#17223B]"
                : "text-[#7B8494] hover:text-[#344054]"
            }`}
          >
            Deadlines
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fees")}
            className={`px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === "fees"
                ? "border-b-2 border-[#233A6C] text-[#17223B]"
                : "text-[#7B8494] hover:text-[#344054]"
            }`}
          >
            Fees & Progress
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2.5 text-[12px] font-medium transition-colors ${
              activeTab === "ai"
                ? "border-b-2 border-[#233A6C] text-[#17223B]"
                : "text-[#7B8494] hover:text-[#344054]"
            }`}
          >
            AI
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* MAIN */}
          <section className="border border-[#E4E7EC] bg-white">
            <div className="border-b border-[#E7E9EE] px-4 py-3">
              <h2 className="text-[12.5px] font-semibold text-[#273449]">
                Case Overview
              </h2>
            </div>

            <div className="grid gap-px bg-[#E7E9EE] sm:grid-cols-2">
              {/* REFERENCE */}
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Reference
                </p>

                <p className="mt-1.5 text-[12px] font-medium text-[#344054]">
                  {caseRecord.referenceNumber}
                </p>
              </div>

              {/* CASE TYPE */}
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Case Type
                </p>

                <p className="mt-1.5 text-[12px] font-medium text-[#344054]">
                  {caseRecord.caseType}
                </p>
              </div>

              {/* CATEGORY */}
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Category
                </p>

                <p className="mt-1.5 text-[12px] font-medium text-[#344054]">
                  {caseRecord.category ?? "—"}
                </p>
              </div>

              {/* PRIORITY */}
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Priority
                </p>

                <p className="mt-1.5 text-[12px] font-medium text-[#344054]">
                  {priorityLabels[caseRecord.priority]}
                </p>
              </div>

              {/* CLIENT */}
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Client
                </p>

                {caseRecord.client ? (
                  <div className="mt-1.5 flex min-w-0 items-center gap-2">
                    <UserRound size={13} className="shrink-0 text-[#98A2B3]" />

                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[12px] font-medium text-[#344054]">
                        {caseRecord.client.name}
                      </p>

                      <span className="text-[9px] text-[#C4C9D2]">•</span>

                      <p className="text-[10px] text-[#667085]">
                        {caseRecord.client.whatsappNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[12px] text-[#98A2B3]">
                    No client linked
                  </p>
                )}
              </div>

              {/* PROFESSIONAL FEE */}
              <div className="bg-white px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Professional Fee
                </p>

                <p className="mt-1.5 text-[12px] font-medium text-[#344054]">
                  {formatMoney(caseRecord.totalFee, caseRecord.currency)}
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="border-t border-[#E7E9EE] px-4 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-[#667085]">
                {caseRecord.description || "No description provided."}
              </p>
            </div>
          </section>

          {/* SIDE */}
          <aside className="border border-[#E4E7EC] bg-white">
            <div className="border-b border-[#E7E9EE] px-4 py-3">
              <h2 className="text-[12.5px] font-semibold text-[#273449]">
                Case Information
              </h2>
            </div>

            <div className="divide-y divide-[#EEF0F3]">
              {/* ASSIGNED TO */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Assigned To
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <UserRound size={13} className="text-[#98A2B3]" />

                  <p className="text-[12px] font-medium text-[#475467]">
                    {caseRecord.assignedUser?.name ?? "Unassigned"}
                  </p>
                </div>
              </div>

              {/* CREATED BY */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Created By
                </p>

                <p className="mt-1.5 text-[12px] font-medium text-[#475467]">
                  {caseRecord.createdBy.name}
                </p>
              </div>

              {/* CREATED */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Created
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <CalendarDays size={13} className="text-[#98A2B3]" />

                  <p className="text-[12px] text-[#667085]">
                    {formatDate(caseRecord.createdAt)}
                  </p>
                </div>
              </div>

              {/* LAST UPDATED */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                  Last Updated
                </p>

                <p className="mt-1.5 text-[12px] text-[#667085]">
                  {formatDate(caseRecord.updatedAt)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* PARTIES TAB */}
      {activeTab === "parties" && <CasePartiesTab caseId={caseRecord.id} />}

      {/* DOCUMENTS TAB */}
      {activeTab === "documents" && <CaseDocumentsTab caseId={caseRecord.id} />}

      {/* DEADLINES TAB */}
      {activeTab === "deadlines" && <CaseDeadlinesTab caseId={caseRecord.id} />}

      {/* FEES & PROGRESS TAB */}
      {activeTab === "fees" && <CaseFeesProgressTab caseRecord={caseRecord} />}

      {/* AI TAB */}
      {activeTab === "ai" && <CaseAiTab caseId={caseRecord.id} />}
    </div>
  );
}
