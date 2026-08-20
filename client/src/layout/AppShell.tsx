import { useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  LogOut,
  Menu,
  MessageSquareText,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";

export default function AppShell() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isArabic = i18n.language.startsWith("ar");

  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex h-10 items-center gap-3 px-3 text-[13px] font-medium transition-colors",
      isArabic ? "border-r-2" : "border-l-2",
      isActive
        ? "border-[#233A6C] bg-[#F3F5F8] text-[#17223B]"
        : "border-transparent text-[#667085] hover:bg-[#F7F8FA] hover:text-[#17223B]",
    ].join(" ");

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#18212F]">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`fixed inset-y-0 z-40 hidden w-[216px] flex-col bg-white lg:flex ${
          isArabic
            ? "right-0 border-l border-[#E7E9EE]"
            : "left-0 border-r border-[#E7E9EE]"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-16 items-center border-b border-[#E7E9EE] px-4">
          <img
            src="/LIS-logo.png"
            alt="LIS-BH"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-5">
          <div className="space-y-1">
            <NavLink to="/cases" className={navItemClass}>
              <BriefcaseBusiness size={17} strokeWidth={1.7} />

              {t("nav.cases")}
            </NavLink>

            <NavLink to="/ai" className={navItemClass}>
              <MessageSquareText size={17} strokeWidth={1.7} />

              {t("nav.ai")}
            </NavLink>

            <NavLink to="/legal-resources" className={navItemClass}>
              <BookOpen size={17} strokeWidth={1.7} />

              {t("nav.legalResources")}
            </NavLink>

            {user?.role === "ADMIN" && (
              <NavLink to="/users" className={navItemClass}>
                <Users size={17} strokeWidth={1.7} />

                {t("nav.users")}
              </NavLink>
            )}
          </div>
        </nav>

        {/* USER */}
        <div className="border-t border-[#E7E9EE] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#DDE1E8] bg-[#F7F8FA] text-[11px] font-semibold text-[#233A6C]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[#273449]">
                {user?.name}
              </p>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                {user?.role}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-[#98A2B3] transition-colors hover:bg-[#F3F5F8] hover:text-[#17223B]"
              aria-label={t("common.signOut")}
              title={t("common.signOut")}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-[#101828]/25 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 z-50 flex w-[250px] flex-col bg-white transition-transform duration-200 lg:hidden ${
          isArabic
            ? `right-0 border-l border-[#E7E9EE] ${
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`
            : `left-0 border-r border-[#E7E9EE] ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#E7E9EE] px-4">
          <img
            src="/LIS-logo.png"
            alt="LIS-BH"
            className="h-10 w-auto object-contain"
          />

          <button
            type="button"
            onClick={closeMobileMenu}
            className="flex h-8 w-8 items-center justify-center text-[#667085] hover:bg-[#F3F5F8] hover:text-[#17223B]"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5">
          <div className="space-y-1">
            <NavLink
              to="/cases"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              <BriefcaseBusiness size={17} strokeWidth={1.7} />

              {t("nav.cases")}
            </NavLink>

            <NavLink
              to="/ai"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              <MessageSquareText size={17} strokeWidth={1.7} />

              {t("nav.ai")}
            </NavLink>

            <NavLink
              to="/legal-resources"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              <BookOpen size={17} strokeWidth={1.7} />

              {t("nav.legalResources")}
            </NavLink>

            {user?.role === "ADMIN" && (
              <NavLink
                to="/users"
                onClick={closeMobileMenu}
                className={navItemClass}
              >
                <Users size={17} strokeWidth={1.7} />

                {t("nav.users")}
              </NavLink>
            )}
          </div>
        </nav>

        {/* MOBILE USER */}
        <div className="border-t border-[#E7E9EE] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#DDE1E8] bg-[#F7F8FA] text-[11px] font-semibold text-[#233A6C]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[#273449]">
                {user?.name}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                {user?.role}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center text-[#98A2B3] hover:bg-[#F3F5F8] hover:text-[#17223B]"
              aria-label={t("common.signOut")}
              title={t("common.signOut")}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className={isArabic ? "lg:pr-[216px]" : "lg:pl-[216px]"}>
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-12 items-center overflow-hidden border-b border-[#E7E9EE] bg-white px-4 sm:px-6 lg:px-7">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] text-[#475467] lg:hidden ${
              isArabic ? "ml-3" : "mr-3"
            }`}
            aria-label="Open navigation"
          >
            <Menu size={17} />
          </button>

          {/* FEATURE TICKER */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div className="lis-feature-ticker flex w-max items-center gap-8 whitespace-nowrap pr-8 text-[11px] font-medium tracking-[0.02em] text-[#8B94A4]">
              <span>Case Management</span>

              <span className="text-[#C5CAD3]">•</span>

              <span>Legal AI</span>

              <span className="text-[#C5CAD3]">•</span>

              <span>Legal Resources</span>

              <span className="text-[#C5CAD3]">•</span>

              <span>Case Documents</span>

              <span className="text-[#C5CAD3]">•</span>

              <span>Deadlines</span>

              <span className="text-[#C5CAD3]">•</span>

              <span>Secure Legal Workspace</span>
            </div>
          </div>

          {/* LANGUAGE + USER */}
          <div
            className={`relative z-10 flex shrink-0 items-center gap-3 bg-white ${
              isArabic ? "mr-5 pr-5" : "ml-5 pl-5"
            }`}
          >
            <LanguageSwitcher />

            <div
              className={`hidden sm:block ${
                isArabic ? "text-left" : "text-right"
              }`}
            >
              <p className="text-[12px] font-medium text-[#344054]">
                {user?.name}
              </p>

              <p className="text-[9px] font-medium uppercase tracking-[0.06em] text-[#98A2B3]">
                {user?.role}
              </p>
            </div>

            <div className="flex h-7 w-7 items-center justify-center border border-[#DDE1E8] bg-[#F7F8FA] text-[9px] font-semibold text-[#233A6C]">
              {initials}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
