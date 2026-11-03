"use client";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="flex items-center flex-col p-2 relative h-[32rem] bg-gray-100 justify-center">
      <div className="max-w-3xl flex items-center flex-col gap-4">
        <h1 className="text-3xl md:text-5xl font-extrabold z-10 mb-1 text-center">
          Your Elastic Path Subscription
        </h1>
        <h2 className="text-sm md:text-base z-10 text-center">
          Get access to exclusive deals, discounts, and more with your Elastic Path Subscription.
        </h2>
        <button
          className="text-black bg-[#2BCC7E] hover:bg-[#24b36e] hover:shadow-lg mt-2 z-10 rounded-md py-3 px-4 font-bold"
          onClick={() => {
            router.push("/subscriptions");
          }}
        >
          View Subscription Plans
        </button>
      </div>
    </div>
  );
}