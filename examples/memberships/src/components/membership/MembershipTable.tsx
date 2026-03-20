import React from "react";
import Link from "next/link";
import { GetOfferingResponse } from "@epcc-sdk/sdks-shopper";
import { Button } from "../button/Button";

interface IMembershipTableProps {
  offering: GetOfferingResponse;
}

const MembershipTable: React.FC<IMembershipTableProps> = ({ offering }) => {
  const plans = offering.included?.plans ?? [];

  return (
    <div className="p-4">
      <div className="w-full mx-auto py-6 flex flex-col items-center">
        <h2 className="text-4xl font-semibold text-center mb-4">Membership</h2>
        <p className="text-xl font-semibold text-center mb-6">
          Choose a membership plan that&apos;s best for you
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border border-[#DEE4F3] rounded-lg p-6 flex flex-col gap-4"
            >
              <div>
                <h3 className="text-xl font-semibold">
                  {plan.attributes?.name}
                </h3>
                {plan.attributes?.description && (
                  <p className="text-sm text-[#62687A] mt-1">
                    {plan.attributes.description}
                  </p>
                )}
              </div>
              <div className="mt-auto pt-4">
                <Button asChild size="small" className="w-full">
                  <Link href={`/membership/${plan.id}`}>Select plan</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipTable;
