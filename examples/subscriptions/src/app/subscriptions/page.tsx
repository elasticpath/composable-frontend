import Footer from '../../components/footer/Footer';
import SubscriptionPlans from './SubscriptionPlans';
import { listOfferings } from '@epcc-sdk/sdks-shopper';
import { initializeShopperClient } from "@/lib/epcc-shopper-client";

export default async function MembershipPage() {
    initializeShopperClient();

    const response = await listOfferings({
        query: {
            include: ['plans', 'pricing_options', 'features'] as const
        }
    });

    const offerings = response.error ? null : {
        data: response.data?.data?.[0],
        included: response.data?.included
    };

    return (
        <>
            <SubscriptionPlans offerings={offerings} />
            <Footer />
        </>
    );
}
