"use client";
import { useRouter, usePathname } from "next/navigation";
import { SUPPORTED_LOCALES } from "src/lib/i18n";
import { ConfirmLocaleChangeModal } from "./ConfirmLocaleChangeModal";
import { useState } from "react";
import { removeAllCartItemsAction } from "src/app/[lang]/(store)/products/[productId]/actions/cart-actions";
import { useNotify } from "src/hooks/use-event";

export const LocaleSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const notify = useNotify();
  const currentLocale = pathname.split("/")[1];
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    if (newLocale === currentLocale) return;
    setPendingLocale(newLocale);
    setShowModal(true);
  };

  const clearCart = async () => {
    try {
      const result = await removeAllCartItemsAction()
      if (result.error) {
        notify({
          scope: "cart",
          type: "error",
          action: "remove-cart-item",
          message: (result.error as any).errors[0]?.detail,
          cause: {
            type: "cart-store-error",
            cause: new Error(JSON.stringify(result.error)),
          },
        })
      } else {
        notify({
          scope: "cart",
          type: "success",
          action: "remove-cart-item",
          message: "Successfully removed all cart items",
        })
      }
    } catch (e) {
      console.error("Failed clearing cart", e);
    }
  };

  const confirmChange = async () => {
    if (!pendingLocale) return;
    await clearCart();
    const segments = pathname.split("/");
    segments[1] = pendingLocale;
    setShowModal(false);
    router.push(segments.join("/"));
  };

  return (
    <>
      <select id='locale_select' value={currentLocale} onChange={handleChange} className="border p-1 w-[6rem] rounded">
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {loc.toUpperCase()}
          </option>
        ))}
      </select>
      <ConfirmLocaleChangeModal
        open={showModal}
        onConfirm={confirmChange}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};