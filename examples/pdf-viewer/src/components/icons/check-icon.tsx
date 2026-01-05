import clsx from "clsx";
import { SVGProps } from "react";

export default function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={clsx(props.className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.1644 4.7526C17.5771 5.11952 17.6143 5.75159 17.2474 6.16437L9.24741 15.1644C9.06444 15.3702 8.80467 15.4915 8.52937 15.4996C8.25408 15.5077 7.98764 15.4019 7.79289 15.2071L3.79289 11.2071C3.40237 10.8166 3.40237 10.1834 3.79289 9.7929C4.18342 9.40238 4.81658 9.40238 5.20711 9.7929L8.45718 13.043L15.7526 4.83565C16.1195 4.42286 16.7516 4.38568 17.1644 4.7526Z"
        fill="#2BCC7E"
      />
    </svg>
  );
}
