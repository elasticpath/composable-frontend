import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_KEY } from "@/app/constants";
import Header from "./Header";

export default async function HeaderWrapper() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;
    const isAuthenticated = !!authToken;
    
    return <Header isAuthenticated={isAuthenticated} />;
}