import { useQuery } from "@tanstack/react-query";

export type ShippingMethod = {
  label: string;
  value: string;
  amount: number;
  formatted: string;
};


type APIShippingMethod = {
  name: string;
  description: string;
  slug: string;
  basis: string;
  price:{
    amount:number; 
    currency:string; 
    formatted:string;
  }
  max:number;
  module_id:string;
  shipping_method:string;
  amount:number;
}

export function useShippingMethod(cartId?:string) {
    const deliveryMethods = useQuery({
      queryKey: [`${cartId}-delivery-methods`],
      queryFn: async () => {
        	const res = await fetch(`${process.env.NEXT_PUBLIC_SHIPPING_API_ENDPOINT}?cart_id=${cartId}`,{headers: {
            "Api-Key": `${process.env.NEXT_PUBLIC_SHIPPING_API_KEY}`
          }});
          const json= await res.json() as APIShippingMethod[];
		      return json.map(apiShippingMethod=> ({label:apiShippingMethod.name, value:apiShippingMethod.slug, amount:apiShippingMethod.price.amount, formatted:apiShippingMethod.price.formatted}) as ShippingMethod);
      }
    });
    return deliveryMethods;
}


