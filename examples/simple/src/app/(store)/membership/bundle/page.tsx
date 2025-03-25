import { getOffering } from "@epcc-sdk/sdks-shopper";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "../../../../lib/cookie-constants";
import Link from "next/link";
import BundleTable from "../../../../components/membership/BundleTable";
import { createElasticPathClient } from "../create-elastic-path-client";

export default async function MembershipPricingOptionsPage() {
  const client = createElasticPathClient();

  const bundleOffering = await getOffering({
    client: client,
    path: {
      offering_uuid: "3e88d790-f86a-45d5-8ad6-80ab78169940",
    },
    query: {
      include: "plans,products,features",
    },
  });

  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!cartCookie) {
    throw new Error("Cart cookie not found");
  }

  if (!bundleOffering.data?.data) {
    return <div>Offering not found</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto p-4">
        <div className="w-full mx-auto py-6 px-[6rem]">
          <h2 className="text-4xl font-semibold text-center mb-4">
            ATD Membership
          </h2>
          <p className="text-xl font-semibold text-center mb-6">
            Choose a membership plan that’s best for you
          </p>
          <div className="border border-[#DEE4F3] rounded-lg p-4 flex justify-between items-center my-[3rem]">
            <div>
              <p className="text-sm font-normal text-[#62687A]">
                Selected Plan
              </p>
              <p className="text-xl font-semibold">
                {bundleOffering.data?.data.attributes.name}
              </p>
            </div>
            <Link
              href="/membership"
              className="text-[#1F8552] font-normal underline"
            >
              Change
            </Link>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-center mb-6">
              Select your rate and billing option:
            </h3>
            <BundleTable offering={bundleOffering.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
