import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { resetPassword } from "../../api/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      toast.error("Password reset link is invalid.");
      return;
    }

    if (!newPassword) {
      toast.error("Enter your new password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await resetPassword(token, newPassword);

      toast.success(response.message);
      setIsComplete(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to reset password.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#18212F]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col bg-white px-5 sm:px-8 lg:px-12">
        {/* HEADER */}
        <div className="flex h-20 items-center justify-between border-b border-[#E7E9EE]">
          <Link to="/">
            <img
              src="/LIS-logo.png"
              alt="LIS-BH"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition-colors hover:text-[#17223B]"
          >
            <ArrowLeft size={15} />
            Back to login
          </Link>
        </div>

        {/* CONTENT */}
        <main className="flex flex-1 items-start justify-center pb-10 pt-14 sm:items-center sm:py-16">
          <div className="w-full max-w-[400px]">
            {!isComplete ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                  <KeyRound size={18} />
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-[#172033]">
                  Reset your password
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  Enter a new password for your LIS-BH account.
                </p>

                {!token ? (
                  <div className="mt-8 border border-[#E4E7EC] bg-[#F8F9FB] p-4">
                    <p className="text-sm font-medium text-[#344054]">
                      Invalid reset link
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#667085]">
                      This password reset link is missing or invalid.
                    </p>

                    <Link
                      to="/forgot-password"
                      className="mt-5 flex h-11 items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
                    >
                      Request New Reset Link
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8">
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-medium text-[#344054]"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Enter your new password"
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
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-5 flex h-11 w-full items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}

                <div className="mt-7 flex items-center gap-2 border-t border-[#E7E9EE] pt-5 text-xs text-[#8B94A4]">
                  <ShieldCheck size={14} />
                  Secure password reset
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                  <ShieldCheck size={18} />
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-[#172033]">
                  Password updated
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  Your password has been reset successfully. You can now sign in
                  with your new password.
                </p>

                <Link
                  to="/login"
                  className="mt-7 flex h-11 w-full items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-[#E7E9EE] py-5 text-xs text-[#98A2B3]">
          © 2026 LIS-BH. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
