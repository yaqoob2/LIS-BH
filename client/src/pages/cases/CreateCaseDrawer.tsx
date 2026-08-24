import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { createCase } from "../../api/cases";
import { getClients } from "../../api/clients";
import { getUsers } from "../../api/users";
import { useAuth } from "../../auth/AuthContext";

import type {
  CasePriority,
  CaseStatus,
  CreateCaseRequest,
} from "../../types/case";
import type { Client } from "../../types/client";
import type { InternalUser } from "../../types/user";

import CreateClientModal from "./CreateClientModal";

interface CreateCaseDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}

export default function CreateCaseDrawer({
  open,
  onClose,
  onCreated,
}: CreateCaseDrawerProps) {
  const { user } = useAuth();

  const [referenceNumber, setReferenceNumber] = useState("");
  const [title, setTitle] = useState("");
  const [caseType, setCaseType] = useState("");
  const [category, setCategory] = useState("");

  const [status, setStatus] = useState<CaseStatus>("OPEN");

  const [priority, setPriority] = useState<CasePriority>("MEDIUM");

  const [description, setDescription] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);

  const [totalFee, setTotalFee] = useState("");

  const [users, setUsers] = useState<InternalUser[]>([]);

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createClientOpen, setCreateClientOpen] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    if (!query) {
      return clients.slice(0, 6);
    }

    return clients
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.whatsappNumber.toLowerCase().includes(query) ||
          item.identityNumberMasked.toLowerCase().includes(query)
        );
      })
      .slice(0, 6);
  }, [clients, clientSearch]);

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadClients() {
      try {
        setIsLoadingClients(true);

        const data = await getClients();

        setClients(data.filter((item) => item.isActive));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load clients.",
        );
      } finally {
        setIsLoadingClients(false);
      }
    }

    void loadClients();
  }, [open]);

  useEffect(() => {
    if (!open || user?.role !== "ADMIN") {
      return;
    }

    async function loadUsers() {
      try {
        setIsLoadingUsers(true);

        const data = await getUsers();

        setUsers(data.filter((item) => item.isActive));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load users.";

        toast.error(message);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    void loadUsers();
  }, [open, user?.role]);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function resetForm() {
    setReferenceNumber("");
    setTitle("");
    setCaseType("");
    setCategory("");
    setStatus("OPEN");
    setPriority("MEDIUM");
    setDescription("");
    setAssignedUserId("");

    setSelectedClientId("");
    setClientSearch("");
    setIsClientSearchOpen(false);

    setTotalFee("");
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  function handleClientSelected(client: Client) {
    setClients((current) => {
      const exists = current.some((item) => item.id === client.id);

      if (exists) {
        return current.map((item) => (item.id === client.id ? client : item));
      }

      return [client, ...current];
    });

    setSelectedClientId(client.id);
    setClientSearch("");
    setIsClientSearchOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!referenceNumber.trim() || !title.trim() || !caseType.trim()) {
      toast.error("Reference number, title and case type are required.");
      return;
    }

    const cleanFee = totalFee.trim();

    if (cleanFee) {
      if (!/^\d+(\.\d{1,3})?$/.test(cleanFee)) {
        toast.error("Professional fee can have up to 3 decimal places.");
        return;
      }

      const numericFee = Number(cleanFee);

      if (!Number.isFinite(numericFee) || numericFee < 0.001) {
        toast.error("Professional fee must be greater than zero.");
        return;
      }
    }

    const payload: CreateCaseRequest = {
      referenceNumber: referenceNumber.trim(),
      title: title.trim(),
      caseType: caseType.trim(),
      status,
      priority,
    };

    if (category.trim()) {
      payload.category = category.trim();
    }

    if (description.trim()) {
      payload.description = description.trim();
    }

    if (assignedUserId) {
      payload.assignedUserId = assignedUserId;
    }

    if (selectedClientId) {
      payload.clientId = selectedClientId;
    }

    if (cleanFee) {
      payload.totalFee = Number(cleanFee);
      payload.currency = "BHD";
    }

    try {
      setIsSubmitting(true);

      await createCase(payload);

      toast.success("Case created successfully.");

      resetForm();
      onClose();

      await onCreated();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create case.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <>
      {/* OVERLAY */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-[#101828]/25"
        aria-label="Close create case"
      />

      {/* DRAWER */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#E4E7EC] bg-white sm:max-w-[460px]">
        {/* HEADER */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E7E9EE] px-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[#172033]">
              New Case
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8B94A4]">
              Create a new legal matter.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center text-[#667085] transition-colors hover:bg-[#F5F6F8] hover:text-[#17223B]"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {/* CASE INFORMATION */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
                  Case Information
                </p>
              </div>

              {/* REFERENCE */}
              <div>
                <label
                  htmlFor="referenceNumber"
                  className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                >
                  Reference Number
                </label>

                <input
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(event) => setReferenceNumber(event.target.value)}
                  placeholder="CASE-2026-001"
                  maxLength={100}
                  className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>

              {/* TITLE */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                >
                  Case Title
                </label>

                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Employment Contract Dispute"
                  maxLength={250}
                  className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>

              {/* TYPE + CATEGORY */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="caseType"
                    className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                  >
                    Case Type
                  </label>

                  <input
                    id="caseType"
                    value={caseType}
                    onChange={(event) => setCaseType(event.target.value)}
                    placeholder="Labour"
                    maxLength={100}
                    className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                  >
                    Category
                  </label>

                  <input
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Employment"
                    maxLength={100}
                    className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                  />
                </div>
              </div>

              {/* STATUS + PRIORITY */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="status"
                    className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as CaseStatus)
                    }
                    className="h-9 w-full border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#475467] outline-none focus:border-[#667694]"
                  >
                    <option value="OPEN">Open</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="AWAITING_RESPONSE">Awaiting Response</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                  >
                    Priority
                  </label>

                  <select
                    id="priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as CasePriority)
                    }
                    className="h-9 w-full border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#475467] outline-none focus:border-[#667694]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* ASSIGNMENT */}
              {user?.role === "ADMIN" ? (
                <div>
                  <label
                    htmlFor="assignedUser"
                    className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                  >
                    Assigned User
                  </label>

                  <select
                    id="assignedUser"
                    value={assignedUserId}
                    disabled={isLoadingUsers}
                    onChange={(event) => setAssignedUserId(event.target.value)}
                    className="h-9 w-full border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#475467] outline-none focus:border-[#667694] disabled:bg-[#F7F8FA]"
                  >
                    <option value="">
                      {isLoadingUsers ? "Loading users..." : "Unassigned"}
                    </option>

                    {users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.email}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2.5 border border-[#E4E7EC] bg-[#FAFAFB] px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={assignedUserId === user?.id}
                    onChange={(event) =>
                      setAssignedUserId(
                        event.target.checked ? (user?.id ?? "") : "",
                      )
                    }
                    className="h-3.5 w-3.5"
                  />

                  <span className="text-[12px] text-[#475467]">
                    Assign this case to me
                  </span>
                </label>
              )}

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional case summary..."
                  maxLength={5000}
                  rows={4}
                  className="w-full resize-none border border-[#DDE1E8] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>

              {/* CLIENT + FEE DIVIDER */}
              <div className="border-t border-[#EEF0F3] pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
                  Client & Fee
                </p>
              </div>

              {/* CLIENT */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="clientSearch"
                    className="text-[12px] font-medium text-[#344054]"
                  >
                    Client
                  </label>

                  <button
                    type="button"
                    onClick={() => setCreateClientOpen(true)}
                    className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#53627E] transition-colors hover:text-[#17223B]"
                  >
                    <Plus size={12} />
                    Add Client
                  </button>
                </div>

                {selectedClient ? (
                  <div className="flex items-center justify-between border border-[#DDE1E8] bg-[#FAFAFB] px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#E1E4EA] bg-white text-[#667085]">
                        <UserRound size={13} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-medium text-[#273449]">
                          {selectedClient.name}
                        </p>

                        <p className="mt-0.5 truncate text-[9.5px] text-[#98A2B3]">
                          {selectedClient.whatsappNumber}
                          {" • "}
                          {selectedClient.identityType}
                          {" • "}
                          {selectedClient.identityNumberMasked}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClientId("");
                        setClientSearch("");
                        setIsClientSearchOpen(true);
                      }}
                      className="ml-3 shrink-0 text-[10px] font-medium text-[#667085] transition-colors hover:text-[#17223B]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search
                      size={13}
                      className="pointer-events-none absolute left-3 top-[11px] text-[#98A2B3]"
                    />

                    <input
                      id="clientSearch"
                      type="search"
                      value={clientSearch}
                      disabled={isLoadingClients}
                      onFocus={() => setIsClientSearchOpen(true)}
                      onChange={(event) => {
                        setClientSearch(event.target.value);
                        setIsClientSearchOpen(true);
                      }}
                      placeholder={
                        isLoadingClients
                          ? "Loading clients..."
                          : "Search existing client..."
                      }
                      className="h-9 w-full border border-[#DDE1E8] bg-white pl-8 pr-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694] disabled:bg-[#F7F8FA]"
                    />

                    {isClientSearchOpen && !isLoadingClients && (
                      <div className="absolute left-0 right-0 top-[40px] z-20 max-h-[215px] overflow-y-auto border border-[#DDE1E8] bg-white shadow-sm">
                        {filteredClients.length === 0 ? (
                          <div className="px-3 py-4 text-center">
                            <p className="text-[10.5px] text-[#98A2B3]">
                              No matching clients.
                            </p>

                            <button
                              type="button"
                              onClick={() => setCreateClientOpen(true)}
                              className="mt-2 text-[10.5px] font-medium text-[#53627E]"
                            >
                              Add new client
                            </button>
                          </div>
                        ) : (
                          filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setClientSearch("");
                                setIsClientSearchOpen(false);
                              }}
                              className="flex w-full items-center gap-2.5 border-b border-[#EEF0F3] px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-[#FAFBFC]"
                            >
                              <UserRound
                                size={13}
                                className="shrink-0 text-[#98A2B3]"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11.5px] font-medium text-[#344054]">
                                  {client.name}
                                </p>

                                <p className="mt-0.5 truncate text-[9.5px] text-[#98A2B3]">
                                  {client.whatsappNumber}
                                  {" • "}
                                  {client.identityType}
                                  {" • "}
                                  {client.identityNumberMasked}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PROFESSIONAL FEE */}
              <div>
                <label
                  htmlFor="totalFee"
                  className="mb-1.5 block text-[12px] font-medium text-[#344054]"
                >
                  Professional Fee
                </label>

                <div className="flex">
                  <input
                    id="totalFee"
                    type="text"
                    inputMode="decimal"
                    value={totalFee}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "" || /^\d*(\.\d{0,3})?$/.test(value)) {
                        setTotalFee(value);
                      }
                    }}
                    placeholder="1000.000"
                    className="h-9 min-w-0 flex-1 border border-r-0 border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
                  />

                  <div className="flex h-9 w-[58px] shrink-0 items-center justify-center border border-[#DDE1E8] bg-[#FAFAFB] text-[11px] font-medium text-[#53627E]">
                    BHD
                  </div>
                </div>

                <p className="mt-1 text-[9.5px] text-[#98A2B3]">
                  Total agreed professional fee for this case.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#E7E9EE] px-5 py-3.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-9 border border-[#DDE1E8] bg-white px-4 text-[12px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 bg-[#17223B] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Case"}
            </button>
          </div>
        </form>
      </aside>

      <CreateClientModal
        open={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        onSelected={handleClientSelected}
      />
    </>
  );
}
