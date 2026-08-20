import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

import LanguageSwitcher from "../components/ui/LanguageSwitcher";

type PreviewTab = "cases" | "documents" | "ai";

export default function LandingPage() {
  const { t, i18n } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [previewTab, setPreviewTab] = useState<PreviewTab>("cases");

  const isArabic = i18n.language.startsWith("ar");

  const arrowClass = isArabic ? "rotate-180" : "";

  return (
    <div className="min-h-screen bg-white text-[#18212F]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#E7E9EE] bg-white/95 backdrop-blur">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-6 lg:px-8">
          {/* LOGO */}
          <Link to="/" className="justify-self-start">
            <img
              src="/LIS-logo.png"
              alt="LIS-BH"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-12 md:flex lg:gap-16">
            <a
              href="#capabilities"
              className="whitespace-nowrap text-sm font-medium text-[#596273] transition-colors hover:text-[#17223B]"
            >
              {t("landing.nav.capabilities")}
            </a>

            <a
              href="#how-it-works"
              className="whitespace-nowrap text-sm font-medium text-[#596273] transition-colors hover:text-[#17223B]"
            >
              {t("landing.nav.howItWorks")}
            </a>

            <a
              href="#security"
              className="whitespace-nowrap text-sm font-medium text-[#596273] transition-colors hover:text-[#17223B]"
            >
              {t("landing.nav.security")}
            </a>
          </nav>

          {/* DESKTOP LANGUAGE + LOGIN */}
          <div className="hidden items-center gap-3 justify-self-end md:flex">
            <LanguageSwitcher />

            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
            >
              {t("landing.nav.login")}
            </Link>
          </div>

          {/* MOBILE LANGUAGE + MENU */}
          <div className="col-start-3 row-start-1 flex items-center gap-2 justify-self-end md:hidden">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center border border-[#E1E4EA] text-[#273244]"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
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
                {t("landing.nav.capabilities")}
              </a>

              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 text-sm font-medium text-[#596273]"
              >
                {t("landing.nav.howItWorks")}
              </a>

              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 text-sm font-medium text-[#596273]"
              >
                {t("landing.nav.security")}
              </a>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex h-10 items-center justify-center bg-[#17223B] px-4 text-sm font-medium text-white"
              >
                {t("landing.nav.login")}
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

                {t("landing.hero.badge")}
              </div>

              <h1 className="max-w-lg text-4xl font-semibold tracking-[-0.035em] text-[#172033] sm:text-5xl">
                {t("landing.hero.title1")}

                <span className="block text-[#53627E]">
                  {t("landing.hero.title2")}
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[#667085] sm:text-lg">
                {t("landing.hero.description")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center justify-center gap-2 bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
                >
                  {t("landing.hero.login")}

                  <ArrowRight size={15} className={arrowClass} />
                </Link>

                <a
                  href="#capabilities"
                  className="inline-flex h-10 items-center justify-center border border-[#D9DDE5] bg-white px-5 text-sm font-medium text-[#293448] transition-colors hover:bg-[#F7F8FA]"
                >
                  {t("landing.hero.explore")}
                </a>
              </div>
            </div>

            {/* PRODUCT PREVIEW */}
            <div className="border border-[#DDE1E8] bg-[#F7F8FA] p-2 shadow-[0_18px_45px_rgba(24,33,47,0.08)]">
              <div className="border border-[#E1E4EA] bg-white">
                <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-[#1D2939]">
                      {t("landing.preview.workspace")}
                    </p>

                    <p className="text-[11px] text-[#98A2B3]">
                      {t("landing.preview.overview")}
                    </p>
                  </div>

                  <div className="flex h-7 items-center border border-[#E2E5EA] bg-[#FAFAFB] px-2.5 text-[11px] text-[#667085]">
                    {t("landing.preview.secure")}
                  </div>
                </div>

                {/* PREVIEW TABS */}
                <div className="flex gap-1 border-b border-[#E7E9EE] px-3 pt-3">
                  {[
                    {
                      id: "cases",
                      label: t("landing.preview.tabs.cases"),
                    },
                    {
                      id: "documents",
                      label: t("landing.preview.tabs.documents"),
                    },
                    {
                      id: "ai",
                      label: t("landing.preview.tabs.ai"),
                    },
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
                  {/* CASES */}
                  {previewTab === "cases" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          [t("landing.preview.metrics.openCases"), "12"],
                          [t("landing.preview.metrics.underReview"), "4"],
                          [t("landing.preview.metrics.highPriority"), "3"],
                          [t("landing.preview.metrics.deadlines"), "5"],
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
                          <span>{t("landing.preview.table.reference")}</span>

                          <span>{t("landing.preview.table.case")}</span>

                          <span>{t("landing.preview.table.status")}</span>
                        </div>

                        {[
                          [
                            "CASE-001",
                            t("landing.preview.sampleCases.employment"),
                            t("landing.preview.status.underReview"),
                          ],
                          [
                            "CASE-002",
                            t("landing.preview.sampleCases.commercial"),
                            t("landing.preview.status.open"),
                          ],
                          [
                            "CASE-003",
                            t("landing.preview.sampleCases.contract"),
                            t("landing.preview.status.open"),
                          ],
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

                  {/* DOCUMENTS */}
                  {previewTab === "documents" && (
                    <div className="space-y-3">
                      {[
                        [
                          t("landing.preview.documents.employmentContract"),
                          t("landing.preview.documentTypes.contract"),
                          t("landing.preview.status.ready"),
                        ],
                        [
                          t("landing.preview.documents.clientStatement"),
                          t("landing.preview.documentTypes.statement"),
                          t("landing.preview.status.processing"),
                        ],
                        [
                          t("landing.preview.documents.supportingEvidence"),
                          t("landing.preview.documentTypes.evidence"),
                          t("landing.preview.status.ready"),
                        ],
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

                          <span className="mx-3 text-xs font-medium text-[#596A86]">
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI */}
                  {previewTab === "ai" && (
                    <div className="flex h-full min-h-[250px] flex-col">
                      <div className="max-w-[82%] border border-[#E4E7EC] bg-[#F8F9FB] px-4 py-3 text-sm text-[#475467]">
                        {t("landing.preview.ai.question")}
                      </div>

                      <div
                        className={`mt-3 max-w-[90%] border border-[#DCE2EB] bg-white px-4 py-3 ${
                          isArabic ? "mr-auto" : "ml-auto"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#344054]">
                          <MessageSquareText size={14} />

                          {t("landing.preview.ai.label")}
                        </div>

                        <p className="text-sm leading-6 text-[#667085]">
                          {t("landing.preview.ai.answer")}
                        </p>

                        <div className="mt-3 border-t border-[#EEF0F3] pt-2 text-xs text-[#7B8494]">
                          {t("landing.preview.ai.sources")}
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
                {t("landing.capabilities.label")}
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#18212F] sm:text-3xl">
                {t("landing.capabilities.title")}
              </h2>
            </div>

            <div className="mt-10 grid border-y border-[#DDE1E7] md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BriefcaseBusiness,
                  title: t("landing.capabilities.case.title"),
                  text: t("landing.capabilities.case.text"),
                },
                {
                  icon: MessageSquareText,
                  title: t("landing.capabilities.ai.title"),
                  text: t("landing.capabilities.ai.text"),
                },
                {
                  icon: BookOpen,
                  title: t("landing.capabilities.resources.title"),
                  text: t("landing.capabilities.resources.text"),
                },
                {
                  icon: FileText,
                  title: t("landing.capabilities.documents.title"),
                  text: t("landing.capabilities.documents.text"),
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
                  {t("landing.workflow.label")}
                </p>

                <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("landing.workflow.title")}
                </h2>
              </div>

              <div className="grid gap-px border border-[#E1E4EA] bg-[#E1E4EA] sm:grid-cols-2">
                {[
                  [
                    "01",
                    t("landing.workflow.steps.case.title"),
                    t("landing.workflow.steps.case.text"),
                  ],
                  [
                    "02",
                    t("landing.workflow.steps.context.title"),
                    t("landing.workflow.steps.context.text"),
                  ],
                  [
                    "03",
                    t("landing.workflow.steps.ai.title"),
                    t("landing.workflow.steps.ai.text"),
                  ],
                  [
                    "04",
                    t("landing.workflow.steps.authority.title"),
                    t("landing.workflow.steps.authority.text"),
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

                {t("landing.security.label")}
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                {t("landing.security.title")}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#B8C2D2]">
                {t("landing.security.text")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                t("landing.security.privateStorage"),
                t("landing.security.roleAccess"),
                t("landing.security.secureData"),
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
              {t("landing.cta.title")}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#737D8D]">
              {t("landing.cta.text")}
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex h-10 items-center justify-center gap-2 bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
            >
              {t("landing.cta.button")}

              <ArrowRight size={15} className={arrowClass} />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E8ED] bg-[#F8F9FA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-[#8992A1] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>{t("landing.footer.copyright")}</span>
        </div>
      </footer>
    </div>
  );
}
