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
          <Link key={child.id} href={`/search${child.href}`} passHref>
            <a className="link-hover" onClick={() => onClose()}>
              {child.name}
            </a>
          </Link>
        ))}
        <Link href={`/search${item.href}`} passHref>
          <a className="link-hover font-semibold" onClick={() => onClose()}>
            Browse All
          </a>
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
        className="m-4 mb-0 text-sm font-semibold"
        href={`/search${item.href}`}
        passHref
      >
        <a
          className="link-hover mb-12 flex text-sm font-semibold text-black"
          onClick={() => onClose()}
        >
          Browse All {item.name}
          <ArrowRightIcon className="ml-1 w-4" />
        </a>
      </Link>
    </div>
  );
};

export default NavItemContent;
