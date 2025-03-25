"use client";
import React from "react";
import TableCell from "./TableCell";

interface IPlansTableProps {
  offering: any;
}

const ProTable: React.FC<IPlansTableProps> = ({ offering }) => {
  const plans = offering.included.plans;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-4 border-[#F2F4F8]">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-4 text-left border-4 border-[#F2F4F8]">
              Rate Option
            </th>
            <th className="p-4 text-center border-4 border-[#F2F4F8]">
              12-month
            </th>
            <th className="p-4 text-center border-4 border-[#F2F4F8]">
              24-month
            </th>
            <th className="p-4 text-center border-4 border-[#F2F4F8]">
              36-month
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-4 border-[#F2F4F8]">
            <td className="p-4 font-semibold border-4 border-[#F2F4F8]">
              Standard
            </td>
            <TableCell offering={offering} plan={plans[0]} />
            <TableCell
              offering={offering}
              plan={plans[1]}
              perYear="$335.16 / year"
              savings="Save 16% ($128)"
            />
            <TableCell
              offering={offering}
              plan={plans[2]}
              perYear="$299.25 / year"
              savings="Save 25% ($299)"
            />
          </tr>
          <tr className="border-4 border-[#F2F4F8]">
            <td className="p-4 font-semibold border-4 border-[#F2F4F8]">
              Student
              <div className="text-xs font-normal text-[#62687A]">
                You must be enrolled in a minimum of 12 credit hours per year
                (or the equivalent of at least half-time) at an accredited
                university or college.
              </div>
            </td>
            <TableCell
              offering={offering}
              plan={plans[3]}
              savings="Save $120"
            />
            <TableCell />
            <TableCell />
          </tr>
          <tr className="border-4 border-[#F2F4F8]">
            <td className="p-4 font-semibold border-4 border-[#F2F4F8]">
              Senior
              <div className="text-xs font-normal text-[#62687A]">
                You must be 65 years of age or older.
              </div>
            </td>
            <TableCell
              offering={offering}
              plan={plans[4]}
              savings="Save $100"
            />
            <TableCell />
            <TableCell />
          </tr>
          <tr>
            <td className="p-4 font-semibold border-4 border-[#F2F4F8]">
              Young Professional
              <div className="text-xs font-normal text-[#62687A]">
                You must be 35 years of age or younger to apply.
              </div>
            </td>
            <TableCell offering={offering} plan={plans[5]} savings="Save $20" />
            <TableCell />
            <TableCell />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProTable;
