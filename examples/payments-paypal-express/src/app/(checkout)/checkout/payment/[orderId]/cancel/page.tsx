import Link from "next/link";

export default async function PaymentCancelPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <svg
            className="mx-auto h-16 w-16 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Cancelled
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You cancelled the PayPal payment process.
          </p>
          <p className="mt-1 text-sm text-gray-600 font-semibold">
            No payment has been taken from your account.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        </div>
        <div className="mt-8 space-y-3">
          <div className="flex gap-2 justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Cart
            </Link>
            <Link
              href={`/checkout/payment/${orderId}`}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Try Again
            </Link>
          </div>
          <div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
