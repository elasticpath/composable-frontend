import { Order } from "@elasticpath/js-sdk";
export interface OrderWithShortNumber extends Order {
  order_number?: string;
}