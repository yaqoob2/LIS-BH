import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "../../api/clients";

import type { Client, ClientIdentityType } from "../../types/client";

interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  onSelected: (client: Client) => void;
}

export default function CreateClientModal({
  open,
  onClose,
  onSelected,
}: CreateClientModalProps) {
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("+973");
  const [identityType, setIdentityType] = useState<ClientIdentityType>("CPR");
  const [identityNumber, setIdentityNumber] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, isSubmitting, onClose]);

  function resetForm() {
    setName("");
    setWhatsappNumber("+973");
    setIdentityType("CPR");
    setIdentityNumber("");
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanWhatsapp = whatsappNumber.trim();
    const cleanIdentityNumber = identityNumber.trim();

    if (cleanName.length < 2) {
      toast.error("Client name must be at least 2 characters.");
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(cleanWhatsapp)) {
      toast.error("Enter a valid WhatsApp number including country code.");
      return;
    }

    if (cleanIdentityNumber.length < 4 || cleanIdentityNumber.length > 50) {
      toast.error(
        "CPR or passport number must be between 4 and 50 characters.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createClient({
        name: cleanName,
        whatsappNumber: cleanWhatsapp,
        identityType,
        identityNumber: cleanIdentityNumber,
      });

      onSelected(response.client);

      toast.success(
        response.reused
          ? "Existing client selected."
          : "Client created successfully.",
      );

      resetForm();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create client.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/25 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[390px] border border-[#E4E7EC] bg-white"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#172033]">
              Add Client
            </h2>

            <p className="mt-0.5 text-[10.5px] text-[#8B94A4]">
              Add the client linked to this legal matter.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center text-[#667085] transition-colors hover:bg-[#F5F6F8] hover:text-[#17223B] disabled:opacity-50"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 p-4">
          <div>
            <label
              htmlFor="clientName"
              className="mb-1.5 block text-[11.5px] font-medium text-[#344054]"
            >
              Client Name
            </label>

            <input
              id="clientName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ahmed Ali"
              maxLength={200}
              autoFocus
              className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
            />
          </div>

          <div>
            <label
              htmlFor="whatsappNumber"
              className="mb-1.5 block text-[11.5px] font-medium text-[#344054]"
            >
              WhatsApp Number
            </label>

            <input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="+97333123456"
              maxLength={20}
              className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
            />

            <p className="mt-1 text-[9.5px] text-[#98A2B3]">
              Include the country code, for example +973.
            </p>
          </div>

          <div className="grid grid-cols-[125px_1fr] gap-3">
            <div>
              <label
                htmlFor="identityType"
                className="mb-1.5 block text-[11.5px] font-medium text-[#344054]"
              >
                Identity Type
              </label>

              <select
                id="identityType"
                value={identityType}
                onChange={(event) =>
                  setIdentityType(event.target.value as ClientIdentityType)
                }
                className="h-9 w-full border border-[#DDE1E8] bg-white px-2.5 text-[12px] text-[#475467] outline-none focus:border-[#667694]"
              >
                <option value="CPR">CPR</option>
                <option value="PASSPORT">Passport</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="identityNumber"
                className="mb-1.5 block text-[11.5px] font-medium text-[#344054]"
              >
                {identityType === "CPR" ? "CPR Number" : "Passport Number"}
              </label>

              <input
                id="identityNumber"
                value={identityNumber}
                onChange={(event) => setIdentityNumber(event.target.value)}
                maxLength={50}
                placeholder={
                  identityType === "CPR" ? "Enter CPR" : "Enter passport number"
                }
                className="h-9 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-4 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8 border border-[#DDE1E8] bg-white px-3.5 text-[11px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 bg-[#17223B] px-3.5 text-[11px] font-medium text-white transition-colors hover:bg-[#243250] disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
