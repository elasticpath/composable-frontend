"use client";
import React, { useTransition } from "react";
import { addToCart } from "../../app/(store)/membership/add-to-cart-action";
import { getCookie } from "cookies-next";
import { CART_COOKIE_NAME } from "../../lib/cookie-constants";
import { getCartQueryKey } from "@epcc-sdk/sdks-shopper";
import { client } from "../../lib/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNotify } from "../../hooks/use-event";

interface ITableCellProps {
  offering?: any;
  plan?: any;
  perYear?: string;
  savings?: string;
}

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-product",
} as const;

const TableCell: React.FC<ITableCellProps> = ({
  offering,
  plan,
  perYear,
  savings,
}) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const handleClick = () => {
    const planId = plan.id;
    const offeringId = offering?.data?.id;
    startTransition(async () => {
      try {
        const result = await addToCart({ offeringId, planId });

        if (result.error) {
          notify({
            ...cartErrorOptions,
            message: (result.error as any).errors[0]?.detail,
            cause: {
              type: "cart-store-error",
              cause: new Error(JSON.stringify(result.error)),
            },
          });
        } else {
          notify({
            scope: "cart",
            type: "success",
            action: "add-product",
            message: "Successfully added product to cart",
          });
        }
      } catch (err) {
        notify({
          ...cartErrorOptions,
          message: "Failed to add product to cart",
          cause: {
            type: "cart-store-error",
            cause: err as Error,
          },
        });
      } finally {
        const cartID = await getCookie(CART_COOKIE_NAME);
        const queryKey = getCartQueryKey({
          client,
          path: {
            cartID: cartID!,
          },
          query: {
            include: ["items"],
          },
        });

        await queryClient.invalidateQueries({ queryKey });
      }
    });
  };

  return (
    <td
      className={`w-[160px] h-[100px] p-4 text-center border-4 border-[#F2F4F8] relative transition-all
        ${plan ? "cursor-pointer hover:bg-[#1B80C003] hover:before:bg-[#1B80C003] hover:before:absolute hover:before:inset-0 hover:before:border-2 hover:before:border-[#115C92]" : "bg-[#E5E9F1]"}
        ${isPending ? "pointer-events-none cursor-not-allowed opacity-50" : ""}`}
      onClick={plan && !isPending ? handleClick : undefined}
    >
      {plan && (
        <>
          <span className="font-semibold">
            {plan.meta.display_price.without_tax.formatted}
          </span>
          {perYear && <div className="text-sm text-gray-500">{perYear}</div>}
          {savings && <div className="text-[#1F8552] text-xs">{savings}</div>}
        </>
      )}
    </td>
  );
};

export default TableCell;
