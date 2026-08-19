import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Menu,
  MessageSquareText,
  ShieldCheck,
  X,
} from "lucide-react";

type PreviewTab = "cases" | "documents" | "ai";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("cases");

  return (
    <div className="min-h-screen bg-white text-[#18212F]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#E7E9EE] bg-white/95 backdrop-blur">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-6 lg:px-8">
          {/* LEFT - LOGO */}
          <Link to="/" className="justify-self-start">
            <img
              src="/LIS-logo.png"
              alt="LIS-BH"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          {/* CENTER - DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-12 md:flex lg:gap-16">
            <a
              href="#capabilities"
              className="whitespace-nowrap text-sm font-medium text-[#596273] transition-colors hover:text-[#17223B]"
            >
              Capabilities
            </a>

            <a
              href="#how-it-works"
              className="whitespace-nowrap text-sm font-medium text-[#596273] transition-colors hover:text-[#17223B]"
            >
              How it works
            </a>

            <a
              href="#security"
              className="whitespace-nowrap text-sm font-medium text-[#596273] transition-colors hover:text-[#17223B]"
            >
              Security
            </a>
          </nav>

          {/* RIGHT - DESKTOP LOGIN */}
          <div className="hidden justify-self-end md:block">
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
            >
              Login
            </Link>
          </div>

          {/* RIGHT - MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="col-start-3 row-start-1 flex h-9 w-9 items-center justify-center justify-self-end border border-[#E1E4EA] text-[#273244] md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E7E9EE] bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 text-sm font-medium text-[#596273]"
              >
                Capabilities
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 text-sm font-medium text-[#596273]"
              >
                How it works
              </a>

              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 text-sm font-medium text-[#596273]"
              >
                Security
              </a>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex h-10 items-center justify-center bg-[#17223B] px-4 text-sm font-medium text-white"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-[#ECEEF2]">
          <img
            src="/LIS-logo.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 opacity-[0.025] sm:w-[400px] lg:w-[560px]"
          />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-5 py-2 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-8 lg:py-24">
            <div className="max-w-xl">
              <div className="mb-5 hidden items-center gap-2 border border-[#DFE3EA] bg-[#F7F8FA] px-3 py-1.5 text-xs font-medium text-[#556072] sm:inline-flex">
                <ShieldCheck size={14} />
                Private legal intelligence workspace
              </div>

              <h1 className="max-w-lg text-4xl font-semibold tracking-[-0.035em] text-[#172033] sm:text-5xl">
                Legal intelligence.
                <span className="block text-[#53627E]">Built for Bahrain.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#667085] sm:text-lg">
                Manage cases, legal documents, deadlines and legal research in
                one secure AI-powered workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
                >
                  Login to Workspace
                  <ArrowRight size={15} />
                </Link>

                <a
                  href="#capabilities"
                  className="inline-flex h-10 items-center justify-center border border-[#D9DDE5] bg-white px-5 text-sm font-medium text-[#293448] transition-colors hover:bg-[#F7F8FA]"
                >
                  Explore Features
                </a>
              </div>
            </div>

            {/* INTERACTIVE PRODUCT PREVIEW */}
            <div className="border border-[#DDE1E8] bg-[#F7F8FA] p-2 shadow-[0_18px_45px_rgba(24,33,47,0.08)]">
              <div className="border border-[#E1E4EA] bg-white">
                <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-[#1D2939]">
                      Legal Workspace
                    </p>
                    <p className="text-[11px] text-[#98A2B3]">
                      Case intelligence overview
                    </p>
                  </div>

                  <div className="flex h-7 items-center border border-[#E2E5EA] bg-[#FAFAFB] px-2.5 text-[11px] text-[#667085]">
                    Secure
                  </div>
                </div>

                <div className="flex gap-1 border-b border-[#E7E9EE] px-3 pt-3">
                  {[
                    { id: "cases", label: "Cases" },
                    { id: "documents", label: "Documents" },
                    { id: "ai", label: "Legal AI" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPreviewTab(tab.id as PreviewTab)}
                      className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                        previewTab === tab.id
                          ? "border-[#233A6C] text-[#233A6C]"
                          : "border-transparent text-[#7A8495] hover:text-[#344054]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[290px] p-4 sm:p-5">
                  {previewTab === "cases" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["Open Cases", "12"],
                          ["Under Review", "4"],
                          ["High Priority", "3"],
                          ["Deadlines", "5"],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="border border-[#E4E7EC] bg-white px-3 py-3"
                          >
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[#8B94A4]">
                              {label}
                            </p>
                            <p className="mt-1 text-xl font-semibold text-[#1D2939]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border border-[#E4E7EC]">
                        <div className="grid grid-cols-[1fr_1.8fr_1fr] border-b border-[#E4E7EC] bg-[#F8F9FB] px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[#8A94A4]">
                          <span>Reference</span>
                          <span>Case</span>
                          <span>Status</span>
                        </div>

                        {[
                          ["CASE-001", "Employment Dispute", "Under Review"],
                          ["CASE-002", "Commercial Matter", "Open"],
                          ["CASE-003", "Contract Review", "Open"],
                        ].map((row) => (
                          <div
                            key={row[0]}
                            className="grid grid-cols-[1fr_1.8fr_1fr] border-b border-[#EEF0F3] px-3 py-3 text-xs last:border-b-0"
                          >
                            <span className="font-medium text-[#344054]">
                              {row[0]}
                            </span>

                            <span className="truncate text-[#667085]">
                              {row[1]}
                            </span>

                            <span className="text-[#566680]">{row[2]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewTab === "documents" && (
                    <div className="space-y-3">
                      {[
                        ["Employment Contract", "Contract", "Ready"],
                        ["Client Statement", "Statement", "Processing"],
                        ["Supporting Evidence", "Evidence", "Ready"],
                      ].map(([title, type, status]) => (
                        <div
                          key={title}
                          className="flex items-center justify-between border border-[#E4E7EC] bg-white p-3.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#F3F5F8] text-[#475467]">
                              <FileText size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#344054]">
                                {title}
                              </p>

                              <p className="text-xs text-[#98A2B3]">{type}</p>
                            </div>
                          </div>

                          <span className="ml-3 text-xs font-medium text-[#596A86]">
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {previewTab === "ai" && (
                    <div className="flex h-full min-h-[250px] flex-col">
                      <div className="max-w-[82%] border border-[#E4E7EC] bg-[#F8F9FB] px-4 py-3 text-sm text-[#475467]">
                        What are the relevant legal considerations for this
                        case?
                      </div>

                      <div className="ml-auto mt-3 max-w-[90%] border border-[#DCE2EB] bg-white px-4 py-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#344054]">
                          <MessageSquareText size={14} />
                          Legal AI
                        </div>

                        <p className="text-sm leading-6 text-[#667085]">
                          I can analyse the case context and retrieve relevant
                          legal authority from the firm's legal knowledge base.
                        </p>

                        <div className="mt-3 border-t border-[#EEF0F3] pt-2 text-xs text-[#7B8494]">
                          Sources available when relevant
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section
          id="capabilities"
          className="scroll-mt-20 bg-[#F6F7F9] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
                Core capabilities
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#18212F] sm:text-3xl">
                Everything needed for focused legal work.
              </h2>
            </div>

            <div className="mt-10 grid border-y border-[#DDE1E7] md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BriefcaseBusiness,
                  title: "Case Management",
                  text: "Keep case information, parties, documents and deadlines together.",
                },
                {
                  icon: MessageSquareText,
                  title: "Legal AI",
                  text: "Research legal questions and analyse case context through one dedicated assistant.",
                },
                {
                  icon: BookOpen,
                  title: "Legal Resources",
                  text: "Use the firm’s organized legal knowledge base as legal authority.",
                },
                {
                  icon: FileText,
                  title: "Documents",
                  text: "Securely upload and process case documents for legal work and AI context.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group border-b border-[#DDE1E7] px-5 py-7 transition-colors hover:bg-white md:border-r md:last:border-r-0 lg:border-b-0"
                >
                  <Icon
                    size={19}
                    strokeWidth={1.7}
                    className="text-[#354766]"
                  />

                  <h3 className="mt-5 text-sm font-semibold text-[#263348]">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#737D8D]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section
          id="how-it-works"
          className="scroll-mt-20 bg-white py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  One connected workspace
                </p>

                <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
                  From case facts to legal intelligence.
                </h2>
              </div>

              <div className="grid gap-px border border-[#E1E4EA] bg-[#E1E4EA] sm:grid-cols-2">
                {[
                  [
                    "01",
                    "Case",
                    "Start with the legal matter and core case information.",
                  ],
                  [
                    "02",
                    "Context",
                    "Add parties, documents and important deadlines.",
                  ],
                  [
                    "03",
                    "Legal AI",
                    "Ask questions using the case context automatically.",
                  ],
                  [
                    "04",
                    "Authority",
                    "Use relevant legal resources as supporting sources.",
                  ],
                ].map(([number, title, text]) => (
                  <div key={number} className="bg-white p-5">
                    <span className="text-xs font-semibold text-[#8B95A5]">
                      {number}
                    </span>

                    <h3 className="mt-5 text-sm font-semibold text-[#273449]">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#737D8D]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section
          id="security"
          className="scroll-mt-20 bg-[#17223B] py-14 text-white sm:py-16"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-medium text-[#DDE5F2]">
                <ShieldCheck size={17} />
                Private by design
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Built for confidential legal work.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#B8C2D2]">
                Each deployment operates with its own legal data, private
                documents, controlled user access and dedicated knowledge base.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "Private Storage",
                "Role-Based Access",
                "Secure Legal Data",
              ].map((item) => (
                <span
                  key={item}
                  className="border border-[#3B4963] px-3 py-2 text-xs text-[#D9E0EA]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#18212F] sm:text-3xl">
              Access your legal workspace.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#737D8D]">
              Secure access for authorized legal teams.
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex h-10 items-center justify-center gap-2 bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
            >
              Login to LIS-BH
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E8ED] bg-[#F8F9FA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-[#8992A1] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © 2026 LIS-BH Legal Intelligence System. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
