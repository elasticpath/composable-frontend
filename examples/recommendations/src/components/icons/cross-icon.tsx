import clsx from "clsx";
import { SVGProps } from "react";

export default function CrossIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M4.79289 4.29289C5.18342 3.90237 5.81658 3.90237 6.20711 4.29289L10.5 8.58579L14.7929 4.29289C15.1834 3.90237 15.8166 3.90237 16.2071 4.29289C16.5976 4.68342 16.5976 5.31658 16.2071 5.70711L11.9142 10L16.2071 14.2929C16.5976 14.6834 16.5976 15.3166 16.2071 15.7071C15.8166 16.0976 15.1834 16.0976 14.7929 15.7071L10.5 11.4142L6.20711 15.7071C5.81658 16.0976 5.18342 16.0976 4.79289 15.7071C4.40237 15.3166 4.40237 14.6834 4.79289 14.2929L9.08579 10L4.79289 5.70711C4.40237 5.31658 4.40237 4.68342 4.79289 4.29289Z"
        fill="#CA0B4A"
      />
    </svg>
  );
}
