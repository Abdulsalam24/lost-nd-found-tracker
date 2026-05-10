"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { FACULTIES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  faculty: z.string().min(1, "Select a faculty"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await registerUser(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
        <div className="card w-full max-w-md rounded-2xl p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-ink">Registration Successful!</h2>
          <p className="mt-2 text-sm text-ink-muted">
            We&apos;ve sent a verification email to your address. Please check your inbox and verify your email before logging in.
          </p>
          <Link href="/auth/login" className="btn-primary mt-6 inline-flex rounded-full px-6 py-2.5">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="card w-full max-w-md rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Create Account</h1>
        <p className="mt-1 text-sm text-ink-muted">Join the UniLorin Lost & Found community</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">
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
            <input id="password" type="password" className="input-field" {...register("password")} />
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

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-coral hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
