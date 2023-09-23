import Link from "next/link";

export default function Custom500() {
  return (
    <div className="flex h-[36rem] flex-col items-center justify-center gap-4 p-8">
      <span className="text-center text-xl md:text-3xl">
        500 - Internal server error.
      </span>
      <Link href="/" className="font-md md:font-lg text-brand-primary">
        Back to home
      </Link>
    </div>
  );
}
