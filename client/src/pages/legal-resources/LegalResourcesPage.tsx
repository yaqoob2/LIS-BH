import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, LoaderCircle, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import {
  getLegalResources,
  processLegalResource,
} from "../../api/legalResources";
import { useAuth } from "../../auth/AuthContext";

import type {
  LegalResource,
  ResourceProcessingStatus,
} from "../../types/legalResource";

import UploadLegalResourceDrawer from "./UploadLegalResourceDrawer";

const statusLabels: Record<ResourceProcessingStatus, string> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
};

function statusClass(status: ResourceProcessingStatus) {
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

export default function LegalResourcesPage() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [resources, setResources] = useState<LegalResource[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    try {
      const data = await getLegalResources();

      setResources(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load legal resources.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return resources;
    }

    return resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(query) ||
        resource.documentType.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query) ||
        resource.language.toLowerCase().includes(query) ||
        resource.referenceNumber?.toLowerCase().includes(query),
    );
  }, [resources, search]);

  async function handleProcess(resource: LegalResource) {
    try {
      setProcessingId(resource.id);

      await processLegalResource(resource.id);

      toast.success("Legal resource processed successfully.");

      await loadResources();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to process legal resource.",
      );

      await loadResources();
    } finally {
      setProcessingId(null);
    }
  }

  const readyCount = resources.filter(
    (item) => item.processingStatus === "READY",
  ).length;

  const pendingCount = resources.filter(
    (item) =>
      item.processingStatus === "UPLOADED" ||
      item.processingStatus === "PROCESSING",
  ).length;

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px]">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
              Legal Resources
            </h1>

            <p className="mt-0.5 text-[13px] text-[#7B8494]">
              Laws and legal materials used by Legal AI.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 self-start bg-[#17223B] px-3.5 text-[12.5px] font-medium text-white hover:bg-[#243250] sm:self-auto"
            >
              <Plus size={14} />
              Upload Resource
            </button>
          )}
        </div>

        {/* SMALL SUMMARY */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <div className="flex h-[60px] w-[155px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[10.5px] font-medium text-[#7B8494]">
                Total Resources
              </p>

              <p className="mt-1 text-[17px] font-semibold text-[#172033]">
                {isLoading ? "—" : resources.length}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>

          <div className="flex h-[60px] w-[140px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[10.5px] font-medium text-[#7B8494]">Ready</p>

              <p className="mt-1 text-[17px] font-semibold text-[#172033]">
                {isLoading ? "—" : readyCount}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>

          <div className="flex h-[60px] w-[140px] items-center justify-between border border-[#E4E7EC] bg-white px-3.5">
            <div>
              <p className="text-[10.5px] font-medium text-[#7B8494]">
                Pending
              </p>

              <p className="mt-1 text-[17px] font-semibold text-[#172033]">
                {isLoading ? "—" : pendingCount}
              </p>
            </div>

            <div className="h-6 w-[2px] bg-[#DDE3EC]" />
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-4 border border-[#E4E7EC] bg-white p-2">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search legal resources..."
              className="h-[34px] w-full border border-[#DDE1E8] bg-white pl-8 pr-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-3">
          {isLoading ? (
            <div className="border border-[#E4E7EC] bg-white">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-5 border-b border-[#EEF0F3] px-4 py-4 last:border-b-0"
                >
                  <div className="h-3 w-48 bg-[#EEF0F3]" />
                  <div className="h-3 w-24 bg-[#EEF0F3]" />
                  <div className="h-3 w-20 bg-[#EEF0F3]" />
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center border border-[#E4E7EC] bg-white px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                <BookOpen size={17} />
              </div>

              <p className="mt-3 text-[12.5px] font-medium text-[#344054]">
                {resources.length === 0
                  ? "No legal resources uploaded"
                  : "No resources found"}
              </p>

              <p className="mt-1 max-w-[400px] text-[10.5px] leading-5 text-[#98A2B3]">
                {resources.length === 0
                  ? isAdmin
                    ? "Upload an official legal PDF to begin building the Legal AI knowledge base."
                    : "No active legal resources are currently available."
                  : "Try changing your search."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden border border-[#E4E7EC] bg-white md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#E4E7EC] bg-[#FAFAFB]">
                        <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Resource
                        </th>

                        <th className="w-[130px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Category
                        </th>

                        <th className="w-[110px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Language
                        </th>

                        <th className="w-[110px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Year
                        </th>

                        <th className="w-[125px] px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                          Status
                        </th>

                        {isAdmin && (
                          <th className="w-[130px] px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-[0.04em] text-[#7B8494]">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredResources.map((resource) => (
                        <tr
                          key={resource.id}
                          className="border-b border-[#EEF0F3] last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                                <BookOpen size={14} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[390px] truncate text-[12px] font-medium text-[#273449]">
                                  {resource.title}
                                </p>

                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#98A2B3]">
                                  <span>{resource.documentType}</span>

                                  {resource.referenceNumber && (
                                    <>
                                      <span>•</span>

                                      <span>{resource.referenceNumber}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-[11.5px] text-[#667085]">
                            {resource.category}
                          </td>

                          <td className="px-4 py-3 text-[11.5px] text-[#667085]">
                            {resource.language}
                          </td>

                          <td className="px-4 py-3 text-[11px] text-[#7B8494]">
                            {resource.year ?? "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex border px-1.5 py-[2px] text-[10px] font-medium ${statusClass(
                                resource.processingStatus,
                              )}`}
                            >
                              {statusLabels[resource.processingStatus]}
                            </span>
                          </td>

                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex justify-end">
                                {(resource.processingStatus === "UPLOADED" ||
                                  resource.processingStatus === "FAILED") && (
                                  <button
                                    type="button"
                                    onClick={() => void handleProcess(resource)}
                                    disabled={processingId === resource.id}
                                    className="inline-flex h-8 items-center gap-1.5 px-2.5 text-[10.5px] font-medium text-[#53627E] hover:bg-[#F5F6F8] disabled:opacity-50"
                                  >
                                    {processingId === resource.id ? (
                                      <LoaderCircle
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : null}

                                    {processingId === resource.id
                                      ? "Processing..."
                                      : "Process"}
                                  </button>
                                )}

                                {resource.processingStatus === "READY" && (
                                  <span className="px-2 text-[10.5px] text-[#98A2B3]">
                                    AI Ready
                                  </span>
                                )}

                                {resource.processingStatus === "PROCESSING" && (
                                  <span className="inline-flex items-center gap-1.5 px-2 text-[10.5px] text-[#7B8494]">
                                    <LoaderCircle
                                      size={12}
                                      className="animate-spin"
                                    />
                                    Processing
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-[#EEF0F3] border border-[#E4E7EC] bg-white md:hidden">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                        <BookOpen size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-[#273449]">
                              {resource.title}
                            </p>

                            <p className="mt-1 text-[10.5px] text-[#667085]">
                              {resource.category} • {resource.language}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 border px-1.5 py-[2px] text-[9.5px] font-medium ${statusClass(
                              resource.processingStatus,
                            )}`}
                          >
                            {statusLabels[resource.processingStatus]}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-[10px] text-[#98A2B3]">
                            {resource.referenceNumber ?? resource.documentType}

                            {resource.year ? ` • ${resource.year}` : ""}
                          </p>

                          {isAdmin &&
                            (resource.processingStatus === "UPLOADED" ||
                              resource.processingStatus === "FAILED") && (
                              <button
                                type="button"
                                onClick={() => void handleProcess(resource)}
                                disabled={processingId === resource.id}
                                className="inline-flex h-8 items-center gap-1.5 px-2 text-[10px] font-medium text-[#53627E] disabled:opacity-50"
                              >
                                {processingId === resource.id && (
                                  <LoaderCircle
                                    size={11}
                                    className="animate-spin"
                                  />
                                )}

                                {processingId === resource.id
                                  ? "Processing..."
                                  : "Process"}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-[10.5px] text-[#98A2B3]">
                {filteredResources.length} of {resources.length} resources
              </div>
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <UploadLegalResourceDrawer
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={loadResources}
        />
      )}
    </>
  );
}
