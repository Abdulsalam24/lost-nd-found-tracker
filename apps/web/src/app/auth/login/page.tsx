"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
        <div className="card w-full max-w-md rounded-2xl p-8 text-center">
          <p className="text-ink-muted">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const redirect = searchParams.get("redirect") ?? "/items";

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
      await login(data.email, data.password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="card w-full max-w-md rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Welcome Back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to your UniLorin Lost & Found account</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label">Email Address</label>
            <input id="email" type="email" className="input-field" {...register("email")} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" className="input-field" {...register("password")} />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full rounded-full py-3" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-coral hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
