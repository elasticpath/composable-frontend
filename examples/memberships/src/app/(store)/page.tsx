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
          text: "Choose a membership plan",
        }}
      />
      <div className="grid gap-12 p-[2rem] md:p-[4em]"></div>
    </div>
  );
}
