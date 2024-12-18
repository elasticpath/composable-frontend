import clsx from "clsx";
import { SVGProps } from "react";

export default function EpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-label={`${process.env.SITE_NAME} logo`}
      viewBox="0 0 35 35"
      {...props}
      className={clsx(props.className)}
    >
      <path
        fill="#2BCC7E"
        d="M15.758 12.903c1.164 2.923 1.197 6.232.033 9.155l9.106-.027v-9.125l-9.139-.003Zm0 0 6.46-6.45L15.752 0 10 5.738l3.009 3.002a12.315 12.315 0 0 1 2.749 4.163Zm-2.749 13.294L10 29.199l5.751 5.738 6.468-6.453-6.428-6.426c-.603 1.514-1.554 2.913-2.782 4.139Z"
      />
    </svg>
  );
}
