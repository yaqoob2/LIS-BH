import { useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  LogOut,
  Menu,
  MessageSquareText,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex h-10 items-center gap-3 px-3 text-sm font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white"
      : "text-[#B9C3D3] hover:bg-white/[0.06] hover:text-white",
  ].join(" ");

export default function AppShell() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#18212F]">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col bg-[#17223B] lg:flex">
        {/* LOGO */}
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <img
            src="/LIS-logo.png"
            alt="LIS-BH"
            className="h-12 w-auto object-contain brightness-0 invert"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-5">
          <div className="space-y-1">
            <NavLink to="/cases" className={navItemClass}>
              <BriefcaseBusiness size={18} strokeWidth={1.7} />
              Cases
            </NavLink>

            <NavLink to="/ai" className={navItemClass}>
              <MessageSquareText size={18} strokeWidth={1.7} />
              AI
            </NavLink>

            <NavLink to="/legal-resources" className={navItemClass}>
              <BookOpen size={18} strokeWidth={1.7} />
              Legal Resources
            </NavLink>

            {user?.role === "ADMIN" && (
              <NavLink to="/users" className={navItemClass}>
                <Users size={18} strokeWidth={1.7} />
                Users
              </NavLink>
            )}
          </div>
        </nav>

        {/* USER */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 bg-white/[0.06] text-xs font-semibold text-white">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name}
              </p>

              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[#8F9AAF]">
                {user?.role}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-[#AAB4C5] transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-[#101828]/35 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#17223B] transition-transform duration-200 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <img
            src="/LIS-logo.png"
            alt="LIS-BH"
            className="h-11 w-auto object-contain brightness-0 invert"
          />

          <button
            type="button"
            onClick={closeMobileMenu}
            className="flex h-9 w-9 items-center justify-center text-[#B9C3D3] hover:text-white"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5">
          <div className="space-y-1">
            <NavLink
              to="/cases"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              <BriefcaseBusiness size={18} strokeWidth={1.7} />
              Cases
            </NavLink>

            <NavLink
              to="/ai"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              <MessageSquareText size={18} strokeWidth={1.7} />
              AI
            </NavLink>

            <NavLink
              to="/legal-resources"
              onClick={closeMobileMenu}
              className={navItemClass}
            >
              <BookOpen size={18} strokeWidth={1.7} />
              Legal Resources
            </NavLink>

            {user?.role === "ADMIN" && (
              <NavLink
                to="/users"
                onClick={closeMobileMenu}
                className={navItemClass}
              >
                <Users size={18} strokeWidth={1.7} />
                Users
              </NavLink>
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.06] text-xs font-semibold text-white">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name}
              </p>

              <p className="text-[11px] uppercase tracking-wide text-[#8F9AAF]">
                {user?.role}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center text-[#AAB4C5] hover:text-white"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-[240px]">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#E3E6EB] bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="mr-3 flex h-9 w-9 items-center justify-center border border-[#E1E4EA] text-[#344054] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <div className="flex min-w-0 flex-1 items-center">
            <span className="text-sm font-medium text-[#667085]">
              Legal Intelligence Workspace
            </span>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <UserRound size={16} className="text-[#7B8494]" />

            <span className="max-w-[180px] truncate text-sm font-medium text-[#344054]">
              {user?.name}
            </span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
