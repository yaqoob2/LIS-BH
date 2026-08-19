import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Search, UserRound } from "lucide-react";
import { toast } from "sonner";

import { getCases } from "../../api/cases";
import type { CasePriority, CaseRecord, CaseStatus } from "../../types/case";

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
      return "border-[#D7E4DD] bg-[#F4F8F6] text-[#486557]";

    case "UNDER_REVIEW":
      return "border-[#D9E0EA] bg-[#F5F7FA] text-[#53627E]";

    case "AWAITING_RESPONSE":
      return "border-[#E8DFC9] bg-[#FAF8F2] text-[#786842]";

    case "COMPLETED":
      return "border-[#DCE4E1] bg-[#F5F8F7] text-[#526B62]";

    case "CLOSED":
      return "border-[#E2E4E8] bg-[#F7F7F8] text-[#667085]";
  }
}

function priorityClass(priority: CasePriority) {
  switch (priority) {
    case "LOW":
      return "text-[#667085]";

    case "MEDIUM":
      return "text-[#53627E]";

    case "HIGH":
      return "text-[#8A653A]";

    case "URGENT":
      return "text-[#A34A4A]";
  }
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | "ALL">(
    "ALL",
  );

  useEffect(() => {
    async function loadCases() {
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
    }

    void loadCases();
  }, []);

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
    <div className="mx-auto w-full max-w-[1500px]">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#18212F]">
            Cases
          </h1>

          <p className="mt-1 text-sm text-[#7B8494]">
            Manage your legal matters and case activity.
          </p>
        </div>

        {/* We connect this properly in the next step */}
        <button
          type="button"
          disabled
          className="inline-flex h-10 items-center justify-center gap-2 self-start bg-[#17223B] px-4 text-sm font-medium text-white opacity-50 sm:self-auto"
        >
          <span className="text-lg leading-none">+</span>
          New Case
        </button>
      </div>

      {/* KPI ROW */}
      <div className="mt-6 grid grid-cols-2 border border-[#E1E4EA] bg-white lg:grid-cols-4">
        <div className="border-b border-r border-[#E1E4EA] p-4 lg:border-b-0">
          <p className="text-xs font-medium text-[#7B8494]">Open Cases</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#18212F]">
            {isLoading ? "—" : stats.open}
          </p>
        </div>

        <div className="border-b border-[#E1E4EA] p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium text-[#7B8494]">Under Review</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#18212F]">
            {isLoading ? "—" : stats.underReview}
          </p>
        </div>

        <div className="border-r border-[#E1E4EA] p-4">
          <p className="text-xs font-medium text-[#7B8494]">High / Urgent</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#18212F]">
            {isLoading ? "—" : stats.highPriority}
          </p>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-[#7B8494]">Unassigned</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#18212F]">
            {isLoading ? "—" : stats.unassigned}
          </p>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="mt-5 flex flex-col gap-3 border border-[#E1E4EA] bg-white p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B94A4]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference, title, type or assigned user..."
            className="h-10 w-full border border-[#DDE1E8] bg-white pl-9 pr-3 text-sm text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as CaseStatus | "ALL")
          }
          className="h-10 border border-[#DDE1E8] bg-white px-3 text-sm text-[#475467] outline-none focus:border-[#667694] md:w-[170px]"
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
          className="h-10 border border-[#DDE1E8] bg-white px-3 text-sm text-[#475467] outline-none focus:border-[#667694] md:w-[160px]"
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* CONTENT */}
      <div className="mt-4">
        {isLoading ? (
          <div className="border border-[#E1E4EA] bg-white">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-5 border-b border-[#EEF0F3] px-4 py-5 last:border-b-0"
              >
                <div className="h-3 w-24 bg-[#EEF0F3]" />
                <div className="h-3 w-52 bg-[#EEF0F3]" />
                <div className="h-3 w-24 bg-[#EEF0F3]" />
              </div>
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center border border-[#E1E4EA] bg-white px-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#667085]">
              <BriefcaseBusiness size={18} />
            </div>

            <p className="mt-4 text-sm font-medium text-[#344054]">
              No cases found
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-[#8B94A4]">
              {cases.length === 0
                ? "There are no cases available yet."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden border border-[#E1E4EA] bg-white md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E1E4EA] bg-[#F8F9FB]">
                      <th className="px-4 py-3 text-xs font-medium text-[#667085]">
                        Reference
                      </th>

                      <th className="px-4 py-3 text-xs font-medium text-[#667085]">
                        Title
                      </th>

                      <th className="px-4 py-3 text-xs font-medium text-[#667085]">
                        Type
                      </th>

                      <th className="px-4 py-3 text-xs font-medium text-[#667085]">
                        Status
                      </th>

                      <th className="px-4 py-3 text-xs font-medium text-[#667085]">
                        Priority
                      </th>

                      <th className="px-4 py-3 text-xs font-medium text-[#667085]">
                        Assigned
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCases.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#EEF0F3] transition-colors last:border-b-0 hover:bg-[#FAFBFC]"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-[#354766]">
                          {item.referenceNumber}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="max-w-[340px] truncate text-sm font-medium text-[#273449]">
                            {item.title}
                          </p>

                          {item.category && (
                            <p className="mt-1 max-w-[340px] truncate text-xs text-[#98A2B3]">
                              {item.category}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-sm text-[#667085]">
                          {item.caseType}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={`inline-flex border px-2 py-1 text-xs font-medium ${statusClass(
                              item.status,
                            )}`}
                          >
                            {statusLabels[item.status]}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={`text-sm font-medium ${priorityClass(
                              item.priority,
                            )}`}
                          >
                            {priorityLabels[item.priority]}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          {item.assignedUser ? (
                            <div className="flex items-center gap-2">
                              <UserRound size={14} className="text-[#98A2B3]" />

                              <span className="text-sm text-[#667085]">
                                {item.assignedUser.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#98A2B3]">
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

            {/* MOBILE CASE LIST */}
            <div className="space-y-3 md:hidden">
              {filteredCases.map((item) => (
                <div
                  key={item.id}
                  className="border border-[#E1E4EA] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#53627E]">
                        {item.referenceNumber}
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-[#273449]">
                        {item.title}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-2 py-1 text-[11px] font-medium ${statusClass(
                        item.status,
                      )}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#EEF0F3] pt-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#98A2B3]">
                        Type
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#475467]">
                        {item.caseType}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#98A2B3]">
                        Priority
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium ${priorityClass(
                          item.priority,
                        )}`}
                      >
                        {priorityLabels[item.priority]}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#98A2B3]">
                        Assigned
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#475467]">
                        {item.assignedUser?.name ?? "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RESULT COUNT */}
            <div className="mt-3 text-xs text-[#8B94A4]">
              Showing {filteredCases.length} of {cases.length} cases
            </div>
          </>
        )}
      </div>
    </div>
  );
}
