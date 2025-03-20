interface IPriceProps {
  price: string;
  currency: string;
  styleOverride?: string;
}

const Price = ({
  price,
  currency,
  styleOverride,
}: IPriceProps): JSX.Element => {
  return (
    <span
      className={`${styleOverride ? styleOverride : "font-light text-2xl text-gray-900"}`}
    >
      {price} {currency}
    </span>
  );
};

export default Price;
