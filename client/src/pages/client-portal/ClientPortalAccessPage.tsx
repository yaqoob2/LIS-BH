import {
  BriefcaseBusiness,
  Circle,
  CircleCheck,
  Clock3,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ApiError } from "../../api/client";
import { accessClientPortal, getClientPortal } from "../../api/clientPortal";

import {
  clearPortalToken,
  getPortalToken,
  setPortalToken,
} from "../../auth/portalToken";

import type {
  ClientPortalCase,
  ClientPortalData,
} from "../../types/clientPortal";
import type { CaseStatus } from "../../types/case";
import type { FeeMilestoneStatus } from "../../types/feeMilestone";

const caseStatusLabels: Record<CaseStatus, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  AWAITING_RESPONSE: "Awaiting Response",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

const milestoneStatusLabels: Record<FeeMilestoneStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

function formatMoney(value: string | number | null, currency = "BHD") {
  const numeric = Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return `${currency} 0.000`;
  }

  return `${currency} ${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}`;
}

function caseStatusClass(status: CaseStatus) {
  switch (status) {
    case "OPEN":
      return "border-[#D9E2DD] bg-[#F7F9F8] text-[#52695D]";

    case "UNDER_REVIEW":
      return "border-[#DCE2EA] bg-[#F7F8FA] text-[#53627E]";

    case "AWAITING_RESPONSE":
      return "border-[#E5E0D4] bg-[#FAF9F6] text-[#756647]";

    case "COMPLETED":
      return "border-[#DDE5E1] bg-[#F7F9F8] text-[#526B62]";

    case "CLOSED":
      return "border-[#E1E4E8] bg-[#F8F8F9] text-[#667085]";
  }
}

function MilestoneIcon({ status }: { status: FeeMilestoneStatus }) {
  if (status === "COMPLETED") {
    return <CircleCheck size={17} className="text-[#52695D]" />;
  }

  if (status === "IN_PROGRESS") {
    return <Clock3 size={17} className="text-[#53627E]" />;
  }

  return <Circle size={17} className="text-[#A3AAB7]" />;
}

function milestoneStatusClass(status: FeeMilestoneStatus) {
  switch (status) {
    case "COMPLETED":
      return "text-[#52695D]";

    case "IN_PROGRESS":
      return "text-[#53627E]";

    case "PENDING":
      return "text-[#98A2B3]";
  }
}

export default function ClientPortalAccessPage() {
  const [searchParams] = useSearchParams();

  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);

  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [accessFailed, setAccessFailed] = useState(false);

  const selectedCase = useMemo<ClientPortalCase | null>(
    () =>
      portalData?.cases.find((item) => item.id === selectedCaseId) ??
      portalData?.cases[0] ??
      null,
    [portalData, selectedCaseId],
  );

  useEffect(() => {
    async function initialisePortal() {
      try {
        setIsLoading(true);
        setAccessFailed(false);

        const rawToken = searchParams.get("token");

        let portalAccessToken = getPortalToken();

        if (rawToken) {
          const response = await accessClientPortal(rawToken);

          portalAccessToken = response.accessToken;

          setPortalToken(response.accessToken);

          window.history.replaceState({}, "", "/portal/access");
        }

        if (!portalAccessToken) {
          setAccessFailed(true);
          return;
        }

        const data = await getClientPortal(portalAccessToken);

        setPortalData(data);

        if (data.cases.length > 0) {
          setSelectedCaseId(data.cases[0].id);
        }
      } catch (error) {
        clearPortalToken();
        setPortalData(null);

        if (error instanceof ApiError && error.status === 401) {
          setAccessFailed(true);
          return;
        }

        setAccessFailed(true);
      } finally {
        setIsLoading(false);
      }
    }

    void initialisePortal();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <div className="mx-auto flex min-h-screen w-full max-w-[720px] items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-white text-[#53627E]">
              <LoaderCircle size={16} className="animate-spin" />
            </div>

            <p className="mt-3 text-[12px] font-medium text-[#475467]">
              Opening secure portal...
            </p>

            <p className="mt-1 text-[10.5px] text-[#98A2B3]">
              Please wait while we verify your access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (accessFailed || !portalData) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        {/* HEADER */}
        <header className="border-b border-[#E4E7EC] bg-white">
          <div className="flex h-16 w-full items-center justify-between px-4 sm:px-5 lg:px-8">
            <img
              src="/LIS-logo.png"
              alt="LIS-BH"
              className="h-8 w-auto object-contain lg:h-9"
            />
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[720px] items-center justify-center px-5 py-10">
          <div className="w-full max-w-[460px] border border-[#E4E7EC] bg-white px-5 py-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#667085]">
              <ShieldCheck size={17} />
            </div>

            <h1 className="mt-4 text-[15px] font-semibold text-[#172033]">
              Secure link unavailable
            </h1>

            <p className="mt-2 text-[11.5px] leading-5 text-[#667085]">
              This secure link has expired or has already been used.
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#98A2B3]">
              Please use the latest link sent by the law firm.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* HEADER */}
      <header className="border-b border-[#E4E7EC] bg-white">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-5 lg:px-8">
          <img
            src="/LIS-logo.png"
            alt="LIS-BH"
            className="h-8 w-auto object-contain lg:h-9"
          />

          <div className="flex items-center gap-1.5 text-[10px] text-[#7B8494]">
            <ShieldCheck size={13} className="text-[#667694]" />
            Secure Client Portal
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-4 py-5 sm:px-5 sm:py-7">
        {/* GREETING */}
        <div>
          <p className="text-[11px] text-[#7B8494]">Welcome</p>

          <h1 className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-[#172033]">
            Hello, {portalData.client.name}
          </h1>

          <p className="mt-1 text-[11.5px] text-[#98A2B3]">
            View your case progress and agreed professional fee stages.
          </p>
        </div>

        {/* MULTIPLE CASE SELECTOR */}
        {portalData.cases.length > 1 && (
          <div className="mt-5 border border-[#E4E7EC] bg-white">
            <div className="border-b border-[#E7E9EE] px-3.5 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                Your Cases
              </p>
            </div>

            <div className="divide-y divide-[#EEF0F3]">
              {portalData.cases.map((item) => {
                const active = item.id === selectedCase?.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors ${
                      active ? "bg-[#FAFBFC]" : "bg-white hover:bg-[#FAFBFC]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-[#53627E]">
                        {item.referenceNumber}
                      </p>

                      <p className="mt-0.5 truncate text-[11.5px] font-medium text-[#344054]">
                        {item.title}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10.5px] font-semibold text-[#667085]">
                      {item.progressPercentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedCase ? (
          <>
            {/* CASE HEADER */}
            <section className="mt-5 border border-[#E4E7EC] bg-white">
              <div className="border-b border-[#E7E9EE] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-[#53627E]">
                      {selectedCase.referenceNumber}
                    </p>

                    <h2 className="mt-1 text-[16px] font-semibold text-[#172033]">
                      {selectedCase.title}
                    </h2>

                    <p className="mt-1 text-[10.5px] text-[#98A2B3]">
                      {selectedCase.caseType}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 border px-2 py-1 text-[9.5px] font-medium ${caseStatusClass(
                      selectedCase.status,
                    )}`}
                  >
                    {caseStatusLabels[selectedCase.status]}
                  </span>
                </div>
              </div>

              {/* FEE + PROGRESS */}
              <div className="grid gap-px bg-[#E7E9EE] sm:grid-cols-2">
                <div className="bg-white px-4 py-3.5">
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                    Professional Fee
                  </p>

                  <p className="mt-1.5 text-[13px] font-semibold text-[#344054]">
                    {formatMoney(selectedCase.totalFee, selectedCase.currency)}
                  </p>
                </div>

                <div className="bg-white px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9.5px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
                      Case Progress
                    </p>

                    <span className="text-[11px] font-semibold text-[#53627E]">
                      {selectedCase.progressPercentage}%
                    </span>
                  </div>

                  <div className="mt-2 h-[4px] overflow-hidden bg-[#EEF0F3]">
                    <div
                      className="h-full bg-[#53627E]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, selectedCase.progressPercentage),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* MILESTONES */}
            <section className="mt-3 border border-[#E4E7EC] bg-white">
              <div className="border-b border-[#E7E9EE] px-4 py-3">
                <h2 className="text-[12.5px] font-semibold text-[#273449]">
                  Case Progress
                </h2>

                <p className="mt-0.5 text-[10px] text-[#98A2B3]">
                  Progress through the agreed legal service stages.
                </p>
              </div>

              {selectedCase.milestones.length === 0 ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                  <BriefcaseBusiness size={18} className="text-[#98A2B3]" />

                  <p className="mt-2 text-[11.5px] font-medium text-[#475467]">
                    No progress stages available yet.
                  </p>
                </div>
              ) : (
                <div className="px-4 py-1">
                  {selectedCase.milestones
                    .slice()
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="relative flex gap-3 py-4"
                      >
                        {index < selectedCase.milestones.length - 1 && (
                          <div className="absolute bottom-0 left-[8px] top-[35px] w-px bg-[#E4E7EC]" />
                        )}

                        <div className="relative z-[1] mt-0.5 shrink-0 bg-white">
                          <MilestoneIcon status={milestone.status} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <p className="text-[12px] font-semibold text-[#344054]">
                              {milestone.title}
                            </p>

                            <span
                              className={`text-[9.5px] font-medium ${milestoneStatusClass(
                                milestone.status,
                              )}`}
                            >
                              {milestoneStatusLabels[milestone.status]}
                            </span>
                          </div>

                          {milestone.description && (
                            <p className="mt-1 text-[10.5px] leading-5 text-[#7B8494]">
                              {milestone.description}
                            </p>
                          )}

                          <p className="mt-1.5 text-[11px] font-medium text-[#53627E]">
                            {formatMoney(
                              milestone.amount,
                              selectedCase.currency,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* FOOTER NOTE */}
            <div className="mt-5 border-t border-[#E4E7EC] pt-4 text-center">
              <p className="text-[9.5px] leading-4 text-[#98A2B3]">
                This portal provides a summary of your case progress and agreed
                professional fee stages.
              </p>
            </div>
          </>
        ) : (
          <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center border border-[#E4E7EC] bg-white px-5 text-center">
            <BriefcaseBusiness size={18} className="text-[#98A2B3]" />

            <p className="mt-2 text-[11.5px] font-medium text-[#475467]">
              No cases are available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
