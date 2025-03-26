import { ReactNode } from "react";

export default function MembershipLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-[74rem]">{children}</div>
    </div>
  );
}
