import Link from "next/link";
import { NavigationNode } from "../../../lib/build-site-navigation";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

interface IProps {
  item: NavigationNode;
  onClose: () => void;
}

const NavItemContent = ({ item, onClose }: IProps): JSX.Element => {
  const buildStack = (item: NavigationNode) => {
    return (
      <div key={item.id} className="flex flex-col gap-3 text-sm text-gray-500">
        <span className="font-semibold text-black">{item.name}</span>
        {item.children.map((child: NavigationNode) => (
          <Link
            key={child.id}
            href={`/search${child.href}`}
            passHref
            className="link-hover"
            onClick={() => onClose()}
          >
            {child.name}
          </Link>
        ))}
        <Link
          href={`/search${item.href}`}
          passHref
          className="link-hover font-semibold"
          onClick={() => onClose()}
        >
          Browse All
        </Link>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-y-12 md:grid-cols-3">
        {item.children.map((parent: NavigationNode, index: number) => {
          return <div key={index}>{buildStack(parent)}</div>;
        })}
      </div>
      <hr className="my-6"></hr>
      <Link
        className="text-sm font-semibold link-hover mb-12 flex text-black"
        href={`/search${item.href}`}
        passHref
        onClick={() => onClose()}
      >
        Browse All {item.name}
        <ArrowRightIcon className="ml-1 w-4" />
      </Link>
    </div>
  );
};

export default NavItemContent;
