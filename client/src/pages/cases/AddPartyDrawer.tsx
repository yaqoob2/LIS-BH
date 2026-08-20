import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { createCaseParty } from "../../api/caseParties";
import type { PartyType } from "../../types/caseParty";

interface AddPartyDrawerProps {
  caseId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}

export default function AddPartyDrawer({
  caseId,
  open,
  onClose,
  onCreated,
}: AddPartyDrawerProps) {
  const [name, setName] = useState("");
  const [partyType, setPartyType] = useState<PartyType>("PERSON");
  const [roleInCase, setRoleInCase] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function resetForm() {
    setName("");
    setPartyType("PERSON");
    setRoleInCase("");
    setNotes("");
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !roleInCase.trim()) {
      toast.error("Party name and role in case are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createCaseParty({
        caseId,
        name: name.trim(),
        partyType,
        roleInCase: roleInCase.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      toast.success("Party added successfully.");

      resetForm();
      onClose();

      await onCreated();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add party.";

      toast.error(message);
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
        aria-label="Close add party"
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#E4E7EC] bg-white sm:max-w-[430px]">
        <div className="flex h-16 items-center justify-between border-b border-[#E7E9EE] px-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[#172033]">
              Add Party
            </h2>

            <p className="mt-0.5 text-[11px] text-[#8B94A4]">
              Add a party involved in this case.
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
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Party Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ahmed Ali"
                maxLength={250}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none focus:border-[#667694]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Party Type
              </label>

              <select
                value={partyType}
                onChange={(event) =>
                  setPartyType(event.target.value as PartyType)
                }
                className="h-9 w-full border border-[#DDE1E8] bg-white px-2.5 text-[12px] outline-none focus:border-[#667694]"
              >
                <option value="PERSON">Person</option>
                <option value="COMPANY">Company</option>
                <option value="GOVERNMENT">Government</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Role in Case
              </label>

              <input
                value={roleInCase}
                onChange={(event) => setRoleInCase(event.target.value)}
                placeholder="Claimant"
                maxLength={100}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] outline-none focus:border-[#667694]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#344054]">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes..."
                maxLength={2000}
                rows={5}
                className="w-full resize-none border border-[#DDE1E8] px-3 py-2.5 text-[12px] leading-5 outline-none focus:border-[#667694]"
              />
            </div>
          </div>

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
              className="h-9 bg-[#17223B] px-4 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Party"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
