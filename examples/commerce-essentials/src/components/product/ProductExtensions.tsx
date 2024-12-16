import { Extensions } from "@elasticpath/js-sdk";
import { isSupportedExtension } from "../../lib/is-supported-extension";

interface IProductExtensions {
  extensions: Extensions;
}

const ProductExtensions = ({ extensions }: IProductExtensions): JSX.Element => {
  const extensionsValues = Object.values(extensions ?? {}).flat();
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <span className="mb-4 text-base font-medium uppercase text-gray-800 lg:text-lg">
          More Info
        </span>
        <dl>
          {extensionsValues.map((extension) => {
            const extensionKeys = Object.keys(extension);
            return extensionKeys.map((key) => {
              const value = extension[key];

              const EmptyEntry = (
                <p key={`${key}`}>Unsupported product key: {key}</p>
              );

              if (!isSupportedExtension(value)) {
                console.warn(
                  `Unsupported product extension unable to render "${key}" key`,
                  value,
                );
                return EmptyEntry;
              }

              if (!value) {
                return EmptyEntry;
              }

              return (
                <Extension key={`${key}-${value}`} extKey={key} value={value} />
              );
            });
          })}
        </dl>
      </div>
    </div>
  );
};

function Extension({
  extKey,
  value,
}: {
  extKey: string;
  value: string | number | boolean;
}) {
  let decoratedValue = value;
  if (typeof value === "boolean") {
    decoratedValue = value ? "Yes" : "No";
  }

  return (
    <>
      <dt className="font-semibold capitalize">{extKey}</dt>
      <dd className="mb-2">{decoratedValue}</dd>
    </>
  );
}

export default ProductExtensions;
