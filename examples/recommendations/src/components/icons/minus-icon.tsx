import clsx from "clsx";
import { SVGProps } from "react";

export default function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={clsx(props.className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 10C4 9.44772 4.44772 9 5 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H5C4.44772 11 4 10.5523 4 10Z"
        fill="#14213D"
      />
    </svg>
  );
}
