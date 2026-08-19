import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { forgotPassword } from "../../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await forgotPassword(email.trim());

      toast.success(response.message);
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to process password reset.";

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
            {!submitted ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                  <Mail size={18} />
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-[#172033]">
                  Forgot your password?
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  Enter your account email and we'll send you a password reset
                  link if an active account exists.
                </p>

                <form onSubmit={handleSubmit} className="mt-8">
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-5 flex h-11 w-full items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-7 flex items-center gap-2 border-t border-[#E7E9EE] pt-5 text-xs text-[#8B94A4]">
                  <ShieldCheck size={14} />
                  Password reset requests are handled securely.
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                  <Mail size={18} />
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-[#172033]">
                  Check your email
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  If an active account exists for{" "}
                  <span className="font-medium text-[#344054]">{email}</span>, a
                  password reset link will be sent.
                </p>

                <Link
                  to="/login"
                  className="mt-7 flex h-11 w-full items-center justify-center bg-[#17223B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#243250]"
                >
                  Back to Sign In
                </Link>
              </>
            )}
          </div>
        </main>

        <footer className="border-t border-[#E7E9EE] py-5 text-xs text-[#98A2B3]">
          © 2026 LIS-BH. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
