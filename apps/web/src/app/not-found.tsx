import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-text">404</h1>
      <p className="mt-4 text-lg text-text-secondary">
        This page doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="btn-primary px-6 py-2.5">
          Go Home
        </Link>
        <Link href="/items" className="btn-secondary px-6 py-2.5">
          Browse Items
        </Link>
      </div>
    </div>
  );
}
