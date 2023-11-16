interface IPrice {
  price: string;
  currency: string;
  size?: string;
}

const StrikePrice = ({ price, currency, size }: IPrice): JSX.Element => {
  return (
    <div
      className={`ml-1 mt-4 ${
        size ? size : "text-lg"
      } text-red-500 line-through`}
    >
      {price} {currency}
    </div>
  );
};

export default StrikePrice;
