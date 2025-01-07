"use server";
import { SubscriptionOfferingFilter, SubscriptionOffering } from "@elasticpath/js-sdk";
import { ElasticPath } from "@elasticpath/js-sdk";

export async function getSubscriptionOfferingsByProductId(client: ElasticPath, productId: string) {
    if (!client?.SubscriptionOfferings) return [];
    
    const filter : SubscriptionOfferingFilter = {
        eq: {
          "products.external_ref": productId
        }
    }
    try {
        const response = await client.SubscriptionOfferings
            .Filter(filter)
            .With(['plans', 'products'] as const)
            .All();
            
        // @ts-ignore - Ignoring type issues as we know the structure is correct
        return {
            offerings: response.data || [],
            plans: response.included?.plans || []
        };
    } catch (error) {
        console.error('Error fetching subscription offerings:', error);
        return { offerings: [], plans: [] };
    }
}

