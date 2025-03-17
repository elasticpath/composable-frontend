interface ISaleDisplayProps {
  value: string;
  size?: string;
}

const SaleDisplay = ({
  value,
  size,
}: ISaleDisplayProps): JSX.Element => {
  return (
    <span className={`pr-4 font-light text-red-500 content-center ${size ? size : "text-xl"}`}>
      {value}
    </span>
  );
};

export default SaleDisplay;
