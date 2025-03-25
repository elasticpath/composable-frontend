import { getOffering } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "./create-elastic-path-client";
import MembershipTable from "../../../components/membership/MembershipTable";

export default async function MembershipPage() {
  const client = createElasticPathClient();

  const standardOfferingPromise = getOffering({
    client: client,
    path: {
      offering_uuid: "efb581fd-555e-4973-bacf-fbc3036f68be",
    },
    query: {
      include: "plans,products,features",
    },
  });

  const proOfferingPromise = getOffering({
    client: client,
    path: {
      offering_uuid: "82123918-3ab8-4826-a975-58f07ebd6908",
    },
    query: {
      include: "plans,products,features",
    },
  });

  const bundleOfferingPromise = getOffering({
    client: client,
    path: {
      offering_uuid: "3e88d790-f86a-45d5-8ad6-80ab78169940",
    },
    query: {
      include: "plans,products,features",
    },
  });

  const promises = [
    standardOfferingPromise,
    proOfferingPromise,
    bundleOfferingPromise,
  ];
  const [standardOffering, proOffering, bundleOffering] =
    await Promise.all(promises);

  if (
    !proOffering?.data?.data ||
    !standardOffering?.data?.data ||
    !bundleOffering?.data?.data
  ) {
    return <div>Offering not found</div>;
  }

  return (
    <MembershipTable
      standardOffering={standardOffering.data}
      proOffering={proOffering.data}
      bundleOffering={bundleOffering.data}
    />
  );
}
