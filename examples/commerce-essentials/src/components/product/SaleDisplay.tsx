interface ISaleDisplayProps {
  value: string;
  styleOverride?: string;
}

const SaleDisplay = ({
  value,
  styleOverride,
}: ISaleDisplayProps): JSX.Element => {
  return (
    <span
      className={`${styleOverride ? styleOverride : "pr-4 text-xl font-light text-red-500 content-center"}`}
    >
      {value}
    </span>
  );
};

export default SaleDisplay;
