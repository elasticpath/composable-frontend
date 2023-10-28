import { Search } from "../search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products",
};

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return <Search />;
}
