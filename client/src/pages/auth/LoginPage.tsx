import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      await login(email.trim(), password);

      toast.success("Signed in successfully.");

      navigate("/cases", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#18212F] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      {/* LEFT - LOGIN */}
      <main className="flex min-h-screen flex-col px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* TOP */}
        <div className="flex h-20 items-center justify-between border-b border-[#E7E9EE] lg:border-none">
          <Link to="/" className="flex items-center">
            <img
              src="/LIS-logo.png"
              alt="LIS-BH"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition-colors hover:text-[#17223B]"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>

        {/* FORM AREA */}
        <div className="flex flex-1 items-start justify-center pb-8 pt-12 sm:items-center sm:py-14">
          <div className="w-full max-w-[400px]">
            <div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-[#172033] sm:text-4xl">
                Sign in to LIS-BH
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#667085]">
                Access your legal intelligence workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#344054]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@firm.com"
                  className="h-11 w-full border border-[#D9DDE5] bg-white px-3.5 text-sm text-[#18212F] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#667694]"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#344054]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#53627E] transition-colors hover:text-[#17223B]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full border border-[#D9DDE5] bg-white px-3.5 pr-11 text-sm text-[#18212F] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#667694]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[#7B8494] transition-colors hover:text-[#344054]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* SIGN IN */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-7 border-t border-[#E7E9EE] pt-5">
              <div className="flex items-center gap-2 text-xs text-[#8B94A4]">
                <ShieldCheck size={14} />
                Authorized users only
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#E7E9EE] py-5 text-xs text-[#98A2B3]">
          © 2026 LIS-BH. All rights reserved.
        </div>
      </main>

      {/* RIGHT - BRAND PANEL */}
      <aside className="relative hidden overflow-hidden bg-[#F6F7F9] lg:block">
        {/* WATERMARK */}
        <img
          src="/LIS-logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[620px] -translate-x-1/2 -translate-y-1/2 opacity-[0.025]"
        />

        <div className="relative z-10 flex min-h-screen items-center justify-center p-10 xl:p-16">
          <div className="w-full max-w-2xl border border-[#DDE1E8] bg-white p-2 shadow-[0_18px_45px_rgba(24,33,47,0.07)]">
            <div className="border border-[#E1E4EA] bg-white">
              {/* PREVIEW HEADER */}
              <div className="flex items-center justify-between border-b border-[#E7E9EE] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#172033]">
                    Legal Intelligence Workspace
                  </p>
                  <p className="mt-1 text-xs text-[#98A2B3]">
                    Secure case and legal research environment
                  </p>
                </div>

                <div className="flex h-8 items-center gap-2 border border-[#E2E5EA] bg-[#FAFAFB] px-3 text-xs text-[#667085]">
                  <LockKeyhole size={13} />
                  Private
                </div>
              </div>

              {/* PREVIEW CONTENT */}
              <div className="p-5">
                <div className="grid grid-cols-3 border border-[#E4E7EC]">
                  <div className="border-r border-[#E4E7EC] p-4">
                    <Scale size={18} className="text-[#53627E]" />

                    <p className="mt-5 text-sm font-semibold text-[#273449]">
                      Cases
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7B8494]">
                      Manage legal matters in one workspace.
                    </p>
                  </div>

                  <div className="border-r border-[#E4E7EC] p-4">
                    <FileText size={18} className="text-[#53627E]" />

                    <p className="mt-5 text-sm font-semibold text-[#273449]">
                      Documents
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7B8494]">
                      Keep case files securely organized.
                    </p>
                  </div>

                  <div className="p-4">
                    <ShieldCheck size={18} className="text-[#53627E]" />

                    <p className="mt-5 text-sm font-semibold text-[#273449]">
                      Legal AI
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7B8494]">
                      Research law with case-aware intelligence.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border border-[#E4E7EC]">
                  <div className="border-b border-[#E4E7EC] bg-[#F8F9FB] px-4 py-3">
                    <p className="text-xs font-medium text-[#596273]">
                      Case Workspace
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[#8B94A4]">
                          CASE-2026-001
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#273449]">
                          Employment Contract Dispute
                        </p>
                      </div>

                      <div className="border border-[#DCE1E8] bg-[#F8F9FB] px-2.5 py-1.5 text-xs text-[#53627E]">
                        Under Review
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#EEF0F3] pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#98A2B3]">
                          Priority
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#344054]">
                          High
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#98A2B3]">
                          Type
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#344054]">
                          Labour
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#98A2B3]">
                          Workspace
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#344054]">
                          Secure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
