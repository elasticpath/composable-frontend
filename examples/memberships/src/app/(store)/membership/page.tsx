import { getOffering } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "./create-elastic-path-client";
import MembershipTable from "../../../components/membership/MembershipTable";

export default async function MembershipPage() {
  const client = createElasticPathClient();

  console.log(
    "process.env.NEXT_PUBLIC_SUBSCRIPTION_OFFERING_ID: ",
    process.env.NEXT_PUBLIC_SUBSCRIPTION_OFFERING_ID,
  );

  const offeringResponse = await getOffering({
    client: client,
    path: {
      offering_uuid: process.env.NEXT_PUBLIC_SUBSCRIPTION_OFFERING_ID!,
    },
    query: {
      include: ["plans", "pricing_options", "features"],
    },
  });

  console.log("offeringResponse: ", offeringResponse, client);

  if (!offeringResponse?.data?.data) {
    return <div>Offering not found</div>;
  }

  return <MembershipTable offering={offeringResponse.data} />;
}
