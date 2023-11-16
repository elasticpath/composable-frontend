"use client";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-[36rem] flex-col items-center justify-center gap-4 p-8">
          <span className="text-center text-xl md:text-3xl">
            {error.digest} - Internal server error.
          </span>
          <Link href="/" className="font-md md:font-lg text-brand-primary">
            Back to home
          </Link>
          <button
            className="font-md md:font-lg text-brand-secondary"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
