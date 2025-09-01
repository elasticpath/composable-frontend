import { confirmPayPalPayment } from "./actions";

export default async function ReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ PayerID?: string; token?: string }>;
}) {
  const { orderId } = await params;
  const { PayerID: payerId, token } = await searchParams;

  // This will execute on the server and redirect
  await confirmPayPalPayment(orderId, payerId || null, token || null);

  // This return is technically unreachable due to the redirect in the action
  // but TypeScript requires it
  return null;
}
