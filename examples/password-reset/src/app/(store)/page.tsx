import PromotionBanner from "../../components/promotion-banner/PromotionBanner";
import FeaturedProducts from "../../components/featured-products/FeaturedProducts";
import { Suspense } from "react";

export default async function Home() {
  const promotion = {
    title: "Your Elastic Path storefront",
    description:
      "This marks the beginning, embark on the journey of crafting something truly extraordinary, uniquely yours.",
  };

  return (
    <div>
      <PromotionBanner
        promotion={promotion}
        linkProps={{
          link: "/search",
          text: "Shop Now",
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
