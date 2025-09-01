export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="text-lg">Processing your payment...</p>
        <p className="text-sm text-gray-600">Please wait while we confirm your PayPal payment</p>
      </div>
    </div>
  );
}