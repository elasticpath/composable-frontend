interface IPrice {
  price: string;
  currency: string;
  size?: string;
}

const StrikePrice = ({ price, currency, size }: IPrice): JSX.Element => {
  return (
    <div
      className={`flex ml-1 ${size ? size : "text-xs"} text-gray-500 self-end`}
    >
      Was:
      <div
        className={`ml-1 ${size ? size : "text-xs"} text-gray-500 line-through`}
      >
        {price} {currency}
      </div>
    </div>
  );
};

export default StrikePrice;
