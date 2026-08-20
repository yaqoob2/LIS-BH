import { useCallback, useEffect, useState } from "react";
import { Plus, UserRound } from "lucide-react";
import { toast } from "sonner";

import { getCaseParties } from "../../api/caseParties";
import type { CaseParty, PartyType } from "../../types/caseParty";
import AddPartyDrawer from "./AddPartyDrawer";

interface CasePartiesTabProps {
  caseId: string;
}

const partyTypeLabels: Record<PartyType, string> = {
  PERSON: "Person",
  COMPANY: "Company",
  GOVERNMENT: "Government",
  OTHER: "Other",
};

export default function CasePartiesTab({ caseId }: CasePartiesTabProps) {
  const [parties, setParties] = useState<CaseParty[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadParties = useCallback(async () => {
    try {
      const data = await getCaseParties(caseId);
      setParties(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load parties.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadParties();
  }, [loadParties]);

  return (
    <>
      <section className="mt-4 border border-[#E4E7EC] bg-white">
        <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
          <div>
            <h2 className="text-[12.5px] font-semibold text-[#273449]">
              Parties
            </h2>

            <p className="mt-0.5 text-[10.5px] text-[#98A2B3]">
              People and organizations involved in this case.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 bg-[#17223B] px-3 text-[11.5px] font-medium text-white"
          >
            <Plus size={13} />
            Add Party
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 animate-pulse bg-[#F1F3F5]" />
            ))}
          </div>
        ) : parties.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#667085]">
              <UserRound size={16} />
            </div>

            <p className="mt-3 text-[12px] font-medium text-[#344054]">
              No parties added
            </p>

            <p className="mt-1 text-[10.5px] text-[#98A2B3]">
              Add the people or organizations involved in this case.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E7E9EE] bg-[#FAFAFB]">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase text-[#7B8494]">
                      Name
                    </th>

                    <th className="w-[150px] px-4 py-2.5 text-[10px] font-medium uppercase text-[#7B8494]">
                      Type
                    </th>

                    <th className="w-[180px] px-4 py-2.5 text-[10px] font-medium uppercase text-[#7B8494]">
                      Role
                    </th>

                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase text-[#7B8494]">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {parties.map((party) => (
                    <tr
                      key={party.id}
                      className="border-b border-[#EEF0F3] last:border-b-0"
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-[#273449]">
                        {party.name}
                      </td>

                      <td className="px-4 py-3 text-[11.5px] text-[#667085]">
                        {partyTypeLabels[party.partyType]}
                      </td>

                      <td className="px-4 py-3 text-[11.5px] text-[#475467]">
                        {party.roleInCase}
                      </td>

                      <td className="px-4 py-3 text-[11px] text-[#7B8494]">
                        {party.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-[#EEF0F3] md:hidden">
              {parties.map((party) => (
                <div key={party.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] font-medium text-[#273449]">
                      {party.name}
                    </p>

                    <span className="text-[10px] text-[#667085]">
                      {partyTypeLabels[party.partyType]}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-[#53627E]">
                    {party.roleInCase}
                  </p>

                  {party.notes && (
                    <p className="mt-1.5 text-[10.5px] leading-5 text-[#8B94A4]">
                      {party.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <AddPartyDrawer
        caseId={caseId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={loadParties}
      />
    </>
  );
}
