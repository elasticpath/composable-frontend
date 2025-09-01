import Link from "next/link";

const errorMessages: Record<string, string> = {
  "missing-parameters": "Required payment parameters are missing. Please try again.",
  "no-matching-transaction": "We couldn't find a matching transaction for this payment.",
  "payment-confirmation-failed": "The payment confirmation failed. Please try again or contact support.",
  "processing-error": "An error occurred while processing your payment. Please try again.",
};

export default async function PaymentErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; orderId?: string }>;
}) {
  const { message, orderId } = await searchParams;
  const errorMessage = message && errorMessages[message] ? errorMessages[message] : "An unexpected error occurred during payment processing.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <svg
            className="mx-auto h-16 w-16 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
          {orderId && (
            <p className="mt-2 text-sm text-gray-600">
              Order ID: <span className="font-mono font-semibold">{orderId}</span>
            </p>
          )}
        </div>
        <div className="mt-8 space-y-3">
          <Link
            href={orderId ? `/checkout/payment/${orderId}` : "/checkout"}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Link>
          <div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}