import { useFormik } from "formik";
import { useCart } from "@elasticpath/react-shopper-hooks";

interface FormValues {
  promoCode: string;
}

export const Promotion = (): JSX.Element => {
  const { addPromotionToCart, state } = useCart();

  const initialValues: FormValues = {
    promoCode: "",
  };

  const { handleSubmit, handleChange, values } = useFormik({
    initialValues,
    onSubmit: async (values) => {
      await addPromotionToCart(values.promoCode);
      // TODO handle invalid promo code setErrors(error.errors[0].detail);
    },
  });

  const shouldDisableInput =
    state.kind !== "present-cart-state" ||
    state.groupedItems.promotion.length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <div className="w-full">
            <label className="font-medium" htmlFor="name">
              Gift card or discount code
            </label>
            <div className="mt-2 flex gap-4">
              <input
                id="promoCode"
                type="text"
                className="w-full rounded-md border px-2"
                onChange={handleChange}
                value={values.promoCode}
                disabled={shouldDisableInput}
              ></input>
              <button
                disabled={!values.promoCode}
                className={`${
                  !values.promoCode ? "cursor-not-allowed" : ""
                } primary-btn w-32 rounded bg-sky-950 transition-all duration-200 hover:bg-sky-950/80`}
                type="submit"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
