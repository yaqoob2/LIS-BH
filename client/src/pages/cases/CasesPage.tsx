import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Plus, Search, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getCases } from "../../api/cases";
import type { CasePriority, CaseRecord, CaseStatus } from "../../types/case";
import CreateCaseDrawer from "./CreateCaseDrawer";

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

function statusClass(status: CaseStatus) {
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

function priorityClass(priority: CasePriority) {
  switch (priority) {
    case "LOW":
      return "text-[#667085]";

    case "MEDIUM":
      return "text-[#53627E]";

    case "HIGH":
      return "text-[#7B603A]";

    case "URGENT":
      return "text-[#9B4444]";
  }
}

export default function CasesPage() {
  const navigate = useNavigate();

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<CaseStatus | "ALL">("ALL");

  const [priorityFilter, setPriorityFilter] = useState<CasePriority | "ALL">(
    "ALL",
  );

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  const loadCases = useCallback(async () => {
    try {
      const data = await getCases();
      setCases(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load cases.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const stats = useMemo(() => {
    return {
      open: cases.filter((item) => item.status === "OPEN").length,

      underReview: cases.filter((item) => item.status === "UNDER_REVIEW")
        .length,

      highPriority: cases.filter(
        (item) => item.priority === "HIGH" || item.priority === "URGENT",
      ).length,

      unassigned: cases.filter((item) => item.assignedUserId === null).length,
    };
  }, [cases]);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesSearch =
        !query ||
        item.referenceNumber.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.caseType.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.assignedUser?.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, search, statusFilter, priorityFilter]);

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px]">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
              Cases
            </h1>

            <p className="mt-0.5 text-[13px] text-[#7B8494]">
              Manage legal matters and case activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateDrawerOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-2 self-start bg-[#17223B] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#243250] sm:self-auto"
          >
            <Plus size={15} />
            New Case
          </button>
        </div>

        {/* COMPACT KPI CARDS */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <div className="flex h-[62px] w-[155px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[11px] font-medium text-[#7B8494]">Open</p>

              <p className="mt-1 text-lg font-semibold text-[#172033]">
                {isLoading ? "—" : stats.open}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>

          <div className="flex h-[62px] w-[170px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[11px] font-medium text-[#7B8494]">
                Under Review
              </p>

              <p className="mt-1 text-lg font-semibold text-[#172033]">
                {isLoading ? "—" : stats.underReview}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>

          <div className="flex h-[62px] w-[170px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[11px] font-medium text-[#7B8494]">
                High / Urgent
              </p>

              <p className="mt-1 text-lg font-semibold text-[#172033]">
                {isLoading ? "—" : stats.highPriority}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>

          <div className="flex h-[62px] w-[155px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[11px] font-medium text-[#7B8494]">
                Unassigned
              </p>

              <p className="mt-1 text-lg font-semibold text-[#172033]">
                {isLoading ? "—" : stats.unassigned}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mt-4 flex flex-col gap-2 border border-[#E4E7EC] bg-white p-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cases..."
              className="h-[34px] w-full border border-[#DDE1E8] bg-white pl-8 pr-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CaseStatus | "ALL")
            }
            className="h-[34px] border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#475467] outline-none focus:border-[#667694] sm:w-[135px]"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="AWAITING_RESPONSE">Awaiting Response</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as CasePriority | "ALL")
            }
            className="h-[34px] border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#475467] outline-none focus:border-[#667694] sm:w-[130px]"
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* TABLE / LIST */}
        <div className="mt-3">
          {isLoading ? (
            <div className="border border-[#E4E7EC] bg-white">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-6 border-b border-[#EEF0F3] px-4 py-4 last:border-b-0"
                >
                  <div className="h-3 w-20 bg-[#EEF0F3]" />
                  <div className="h-3 w-44 bg-[#EEF0F3]" />
                  <div className="h-3 w-24 bg-[#EEF0F3]" />
                </div>
              ))}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center border border-[#E4E7EC] bg-white px-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#667085]">
                <BriefcaseBusiness size={16} />
              </div>

              <p className="mt-3 text-[12.5px] font-medium text-[#344054]">
                No cases found
              </p>

              <p className="mt-1 text-[11px] text-[#98A2B3]">
                {cases.length === 0
                  ? "No cases are available yet."
                  : "Try changing your search or filters."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden border border-[#E4E7EC] bg-white md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#E4E7EC] bg-[#FAFAFB]">
                        <th className="w-[125px] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Reference
                        </th>

                        <th className="px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Case
                        </th>

                        <th className="w-[130px] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Type
                        </th>

                        <th className="w-[125px] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Status
                        </th>

                        <th className="w-[90px] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Priority
                        </th>

                        <th className="w-[155px] px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Assigned
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCases.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/cases/${item.id}`)}
                          className="cursor-pointer border-b border-[#EEF0F3] transition-colors last:border-b-0 hover:bg-[#FAFBFC]"
                        >
                          <td className="whitespace-nowrap px-3.5 py-3 text-[12px] font-medium text-[#354766]">
                            {item.referenceNumber}
                          </td>

                          <td className="px-3.5 py-3">
                            <p className="max-w-[420px] truncate text-[12.5px] font-medium text-[#273449]">
                              {item.title}
                            </p>

                            {item.category && (
                              <p className="mt-0.5 max-w-[420px] truncate text-[10.5px] text-[#98A2B3]">
                                {item.category}
                              </p>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-3.5 py-3 text-[12px] text-[#667085]">
                            {item.caseType}
                          </td>

                          <td className="whitespace-nowrap px-3.5 py-3">
                            <span
                              className={`inline-flex border px-1.5 py-[2px] text-[10px] font-medium ${statusClass(
                                item.status,
                              )}`}
                            >
                              {statusLabels[item.status]}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3.5 py-3">
                            <span
                              className={`text-[11.5px] font-medium ${priorityClass(
                                item.priority,
                              )}`}
                            >
                              {priorityLabels[item.priority]}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3.5 py-3">
                            {item.assignedUser ? (
                              <div className="flex min-w-0 items-center gap-1.5">
                                <UserRound
                                  size={12}
                                  className="shrink-0 text-[#A3AAB7]"
                                />

                                <span className="truncate text-[11.5px] text-[#667085]">
                                  {item.assignedUser.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11.5px] text-[#98A2B3]">
                                Unassigned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE LIST */}
              <div className="divide-y divide-[#EEF0F3] border border-[#E4E7EC] bg-white md:hidden">
                {filteredCases.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/cases/${item.id}`)}
                    className="cursor-pointer px-3.5 py-3 transition-colors active:bg-[#FAFBFC]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-medium text-[#53627E]">
                          {item.referenceNumber}
                        </p>

                        <p className="mt-0.5 truncate text-[12.5px] font-semibold text-[#273449]">
                          {item.title}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 border px-1.5 py-[2px] text-[9.5px] font-medium ${statusClass(
                          item.status,
                        )}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#7B8494]">
                      <span>{item.caseType}</span>

                      <span className="text-[#C4C9D2]">•</span>

                      <span className={priorityClass(item.priority)}>
                        {priorityLabels[item.priority]}
                      </span>

                      <span className="text-[#C4C9D2]">•</span>

                      <span className="truncate">
                        {item.assignedUser?.name ?? "Unassigned"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* RESULT COUNT */}
              <div className="mt-2 text-[10.5px] text-[#98A2B3]">
                {filteredCases.length} of {cases.length} cases
              </div>
            </>
          )}
        </div>
      </div>

      {/* CREATE CASE DRAWER */}
      <CreateCaseDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onCreated={loadCases}
      />
    </>
  );
}
