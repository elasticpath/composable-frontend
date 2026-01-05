"use client";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/alert/Alert";

export function PaymentForm() {
  return (
    <fieldset className="flex flex-col gap-6 self-stretch">
      <div>
        <legend className="text-2xl font-medium">Payment</legend>
      </div>
      <Alert>
        <LightBulbIcon className="h-4 w-4" />
        <AlertTitle>Payments set to manual!</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            Manual payments are enabled. To test the checkout flow, configure an
            alternate payment gateway to take real payments.
          </p>
          <p>
            To checkout with manual payments you can just complete the order.
          </p>
        </AlertDescription>
      </Alert>
    </fieldset>
  );
}
