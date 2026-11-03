import Link from 'next/link';

export default async function CheckoutSuccessPage({
    params
}: {
    params: Promise<{ orderId: string }>
}) {
    const { orderId } = await params;

    return (
        <div className="max-w-[600px] mx-auto px-5 py-10 text-center min-h-[60vh] flex flex-col justify-center">
            <div className="bg-white p-12 rounded-xl border border-[#e0e0e0] shadow-sm">
                <div className="text-[3.5rem] mb-6 text-[#4caf50]">✓</div>
                <h1 className="text-[2rem] font-medium m-0 mb-4 text-[#212121]">
                    Order Successful!
                </h1>
                <p className="text-base mb-2 text-muted">
                    Order ID: {orderId}
                </p>
                <p className="text-lg mb-10 text-muted">
                    Thank you for your purchase.
                </p>
                <Link
                    href="/account"
                    className="inline-block px-8 py-3.5 bg-cta text-black no-underline rounded-lg text-base font-bold transition-all duration-200 shadow-sm hover:bg-cta-hover hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-sm"
                >
                    Manage Subscriptions
                </Link>
            </div>
        </div>
    );
}
