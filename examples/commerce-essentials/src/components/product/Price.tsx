import clsx from "clsx";

interface IPriceProps {
  price: string;
  currency: string;
  styleOverride?: string;
  activeSalePrice?: boolean;
}

const Price = ({
  price,
  currency,
  styleOverride,
  activeSalePrice
}: IPriceProps): JSX.Element => {
  return (
    <span
      className={clsx(activeSalePrice && "font-bold", styleOverride ? styleOverride : "text-2xl text-gray-900")}
    >
      {price} {currency}
    </span>
  );
};

export default Price;
