import { useContext } from "react";
import { useCart } from "@elasticpath/react-shopper-hooks";
import Spinner from "../Spinner";
import clsx from "clsx";
import { ProductContext } from "../../lib/product-context";

const CartActions = (): JSX.Element => {
  const context = useContext(ProductContext);
  const { isUpdatingCart } = useCart();

  return (
    <div
      className={clsx(
        context?.isChangingSku && "opacity-20 cursor-default",
        "flex flex-col gap-10",
      )}
    >
      <button
        className="primary-btn flex items-center justify-center py-4 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/10"
        type="submit"
        disabled={isUpdatingCart || context?.isChangingSku}
      >
        <div className="relative">
          {isUpdatingCart ? (
            <Spinner height="h-6" width="w-6" absolute={false} />
          ) : (
            "ADD TO CART"
          )}
        </div>
      </button>
    </div>
  );
};

export default CartActions;
