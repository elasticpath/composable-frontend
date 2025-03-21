"use server";

import ShortUniqueId from "short-unique-id";
import { getServerSideCredentialsClient } from "../../../lib/epcc-server-side-credentials-client";
import { Order, OrderFilter, OrderInclude, OrdersEndpoint, OrderSort, QueryableResource } from "@elasticpath/js-sdk";

interface OrderFilterWithShortOrder extends OrderFilter {
    eq?: OrderFilter['eq'] & {
        order_number: string;
      };
}

interface OrdersEndpointWithShortOrder extends QueryableResource<Order, OrderFilterWithShortOrder, OrderSort, OrderInclude> {
    endpoint: 'orders'
}
const shortIdGen = new ShortUniqueId();

export async function getShortOrderNumber():Promise<string|undefined> {
    return generateShortOrder();
}

async function generateShortOrder(previousShortOrders: string[]=[]):Promise<string | undefined> {
    const shortId = shortIdGen.rnd();
    if (await found(shortId)){
      previousShortOrders.push(shortId);
      return previousShortOrders.length<3?generateShortOrder(previousShortOrders):undefined;
    }
    return shortId;
  }
  
  async function found(shortId: string) {
    const client=getServerSideCredentialsClient();
    const orderEndpoint=client.Orders as OrdersEndpointWithShortOrder;
    orderEndpoint.Filter({eq:{order_number: shortId}});
    const previousShortOrders=await orderEndpoint.All();
    if(previousShortOrders.data.length>0)
      return true;    
    return false;
  }