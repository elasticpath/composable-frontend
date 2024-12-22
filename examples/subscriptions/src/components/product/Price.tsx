interface IPriceProps {
  price: string;
  currency: string;
  size?: string;
}

const Price = ({ price, currency, size }: IPriceProps): JSX.Element => {
  return (
    <span
      className={`mt-4 font-light text-gray-900 ${size ? size : "text-2xl"}`}
    >
      {price} {currency}
    </span>
  );
};

export default Price;
