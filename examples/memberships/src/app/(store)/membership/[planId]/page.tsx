import { getOffering } from "@epcc-sdk/sdks-shopper";
import { notFound } from "next/navigation";
import { createElasticPathClient } from "../create-elastic-path-client";
import PricingOptions from "./PricingOptions";

interface Props {
  params: Promise<{ planId: string }>;
}

export default async function PlanPage({ params }: Props) {
  const { planId } = await params;
  const client = createElasticPathClient();

  const offeringResponse = await getOffering({
    client,
    path: {
      offering_uuid: process.env.NEXT_PUBLIC_SUBSCRIPTION_OFFERING_ID!,
    },
    query: {
      include: ["plans", "pricing_options", "features"],
    },
  });

  if (!offeringResponse?.data?.data) {
    return notFound();
  }

  const offering = offeringResponse.data;
  const plan = offering.included?.plans?.find((p) => p.id === planId);

  if (!plan) {
    return notFound();
  }

  const planPricingOptionIds: string[] =
    (plan.relationships?.pricing_options?.data as { id: string }[] | undefined)?.map(
      (ref) => ref.id,
    ) ?? [];

  const allPricingOptions = offering.included?.pricing_options ?? [];
  const planPricingOptions = allPricingOptions.filter((opt) =>
    planPricingOptionIds.includes(opt.id!),
  );

  return (
    <PricingOptions
      offeringId={offering.data?.id!}
      plan={plan}
      pricingOptions={planPricingOptions}
    />
  );
}
