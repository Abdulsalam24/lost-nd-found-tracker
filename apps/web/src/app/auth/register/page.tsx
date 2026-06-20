"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { resendOtpRequest } from "@/lib/auth";
import { FACULTIES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  faculty: z.string().min(1, "Select a faculty"),
});

type FormData = z.infer<typeof schema>;

const OTP_LENGTH = 6;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, verifyOtp } = useAuth();
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await registerUser(data);
      setEmail(data.email);
      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, OTP_LENGTH - index).split("");
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;

    setVerifying(true);
    setError("");
    try {
      await verifyOtp(email, code);
      window.location.href = "/items";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setError("");
    try {
      await resendOtpRequest(email);
      setResendCooldown(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (step === "otp" && otp.every((d) => d) && otp.join("").length === OTP_LENGTH) {
      handleVerify();
    }
  }, [otp, step]);

  if (step === "otp") {
    return (
      <div className="flex min-h-[95vh] items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md rounded-2xl p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">Verify Your Email</h1>
          <p className="mt-2 text-xs text-ink-muted">
            We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={handleOtpPaste}
                className="h-12 w-11 rounded-xl border border-border-light bg-bg-elevated text-center text-lg font-bold text-text transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                disabled={verifying}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn-primary mt-6 w-full rounded-full py-3"
            onClick={handleVerify}
            disabled={verifying || otp.join("").length !== OTP_LENGTH}
          >
            {verifying ? "Verifying..." : "Verify & Continue"}
          </button>

          <p className="mt-4 text-xs text-ink-muted">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-ink-faint">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                className="font-semibold text-coral hover:underline disabled:opacity-50"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </p>

          <button
            type="button"
            className="mt-3 text-xs text-ink-faint hover:text-ink-muted"
            onClick={() => {
              setStep("form");
              setOtp(Array(OTP_LENGTH).fill(""));
              setError("");
            }}
          >
            Change email address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[95vh] items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md rounded-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Go back
        </button>

        <h1 className="text-2xl font-bold text-ink">Create Account</h1>
        <p className="mt-1 text-xs text-ink-muted">Join the UniLorin Lost & Found community</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="label">Full Name</label>
            <input id="name" type="text" className="input-field" {...register("name")} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email Address</label>
            <input id="email" type="email" className="input-field" placeholder="you@student.unilorin.edu.ng" {...register("email")} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} className="input-field pr-11" {...register("password")} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition-colors hover:text-text"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="faculty" className="label">Faculty</label>
            <select id="faculty" className="input-field" {...register("faculty")}>
              <option value="">Select your faculty</option>
              {FACULTIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {errors.faculty && <p className="error-text">{errors.faculty.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full rounded-full py-3" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-coral hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
