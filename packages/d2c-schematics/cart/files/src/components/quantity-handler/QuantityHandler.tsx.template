import type { CartItem } from "@moltin/sdk";
import { useCart } from "@elasticpath/react-shopper-hooks";

interface IQuantityHandler {
  item: CartItem;
}

const QuantityHandler = ({ item }: IQuantityHandler): JSX.Element => {
  const { updateCartItem } = useCart();

  return (
    <div className="flex w-32 justify-around">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 p-3 font-semibold"
        onClick={() => {
          updateCartItem(item.id, item.quantity - 1);
        }}
      >
        -
      </button>
      <input
        className="flex h-8 w-8 items-center rounded-md border text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        value={item.quantity}
        min={1}
        onChange={(event) => {
          if (Number(event.target.value) > 0) {
            updateCartItem(item.id, Number(event.target.value));
          }
        }}
      ></input>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-200 p-3 font-semibold"
        onClick={() => {
          updateCartItem(item.id, item.quantity + 1);
        }}
      >
        +
      </button>
    </div>
  );
};

export default QuantityHandler;
