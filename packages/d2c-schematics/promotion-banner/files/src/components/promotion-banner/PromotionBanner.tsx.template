"use client";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export interface IPromotion {
  title?: string;
  description?: string;
  imageHref?: string;
}

interface IPromotionBanner {
  linkProps?: {
    link: string;
    text: string;
  };
  alignment?: "center" | "left" | "right";
  promotion: IPromotion;
}

const PromotionBanner = (props: IPromotionBanner): JSX.Element => {
  const router = useRouter();
  const { linkProps, promotion } = props;

  const { title, description } = promotion;

  return (
    <>
      {promotion && (
        <div
          className={clsx(
            "flex items-center flex-col p-2 relative h-[32rem] bg-gray-100 justify-center",
          )}
        >
          <div className="max-w-3xl flex items-center flex-col gap-4">
            {title && (
              <h1 className="text-3xl md:text-5xl font-extrabold z-10 mb-1 text-center">
                {title}
              </h1>
            )}
            {description && (
              <h2 className="text-base md:text-xl z-10 text-center">
                {description}
              </h2>
            )}
            {linkProps && (
              <button
                className="text-white bg-brand-primary hover:bg-brand-highlight hover:shadow-lg mt-2 z-10 rounded-md py-3 px-4 font-bold"
                onClick={() => {
                  router.push(linkProps.link);
                }}
              >
                {linkProps.text}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PromotionBanner;
