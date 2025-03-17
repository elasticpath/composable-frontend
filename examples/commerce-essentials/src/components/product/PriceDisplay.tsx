import Price from "./Price";
import SaleDisplay from "./SaleDisplay";
import StrikePrice from "./StrikePrice";

interface IPriceDisplayProps {
  display_price: any;
  salePriceDisplay: SalePriceDisplayStyle;
  original_display_price: any;
  showCurrency?: boolean;
  priceDisplaySize?: string;
  saleCalcDisplaySize?: string;
}

export enum SalePriceDisplayStyle {
  none = "none",
  strikePrice = "strike-price",
  strikePriceWithCalcValue = "strike-price-with-calc-value",
  strikePriceWithCalcPercent = "strike-price-with-calc-percent"
}

const PriceDisplay = ({
  display_price,
  original_display_price,
  salePriceDisplay,
  showCurrency,
  priceDisplaySize,
  saleCalcDisplaySize
}: IPriceDisplayProps): JSX.Element => {
  const currentPrice = (
    <Price
      price={display_price.formatted}
      currency={showCurrency ? display_price.currency : ""}
      size={priceDisplaySize}
    />
  );

  const currentStrikePrice = original_display_price && (
    <StrikePrice
      price={original_display_price.formatted}
      currency={showCurrency ? original_display_price.currency : ""}
    />
  );

  let displayValue;
  if (
    original_display_price &&
      salePriceDisplay === SalePriceDisplayStyle.strikePriceWithCalcValue
  ) {
    const amountOff = (original_display_price.amount - display_price.amount) / 100;
    const amountOffDisplay = "-" + new Intl.NumberFormat("en", {
      style: "currency",
      currency: display_price.currency,
      trailingZeroDisplay: "stripIfInteger",
    }).format(amountOff);
    displayValue = (
      <SaleDisplay value={amountOffDisplay} size={saleCalcDisplaySize} />
    );
  } else if (
    original_display_price &&
      salePriceDisplay === SalePriceDisplayStyle.strikePriceWithCalcPercent
  ) {
    const amountOff =
      original_display_price.amount -
      display_price.amount;
    const percentOff = (amountOff / original_display_price.amount);
    const percentOffDisplay =
      "-" +
      new Intl.NumberFormat("en", {
        style: "percent",
        roundingMode: "trunc",
      }).format(percentOff);
    displayValue = (
      <SaleDisplay value={percentOffDisplay} size={saleCalcDisplaySize} />
    );
  }
  return (
    <div className="flex flex-col mt-4 items-end">
      {salePriceDisplay === SalePriceDisplayStyle.none && currentPrice}
      {salePriceDisplay === SalePriceDisplayStyle.strikePrice && (
        <>
          {currentPrice}
          {currentStrikePrice}
        </>
      )}
      {(salePriceDisplay === SalePriceDisplayStyle.strikePriceWithCalcValue ||
        salePriceDisplay ===
          SalePriceDisplayStyle.strikePriceWithCalcPercent) && (
          <>
            <div className="flex flex-row">
              {displayValue}
              {currentPrice}
            </div>
            {currentStrikePrice}
          </>
        )}
    </div>
  );
};

export default PriceDisplay;
