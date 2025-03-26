import PromotionBanner from "../../components/promotion-banner/PromotionBanner";
import FeaturedProducts from "../../components/featured-products/FeaturedProducts";
import { Suspense } from "react";

export default async function Home() {
  const promotion = {
    title: "Your Elastic Path membership",
    description:
      "Get access to exclusive deals, discounts, and more with your Elastic Path membership.",
  };

  return (
    <div>
      <PromotionBanner
        promotion={promotion}
        linkProps={{
          link: "/membership",
          text: "View pricing",
        }}
      />
      <div className="grid gap-12 p-[2rem] md:p-[4em]">
        <div className="gap-3 p-8 md:p-16">
          <div>
            <Suspense>
              <FeaturedProducts
                title="Trending Products"
                linkProps={{
                  link: `/search`,
                  text: "See all products",
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
