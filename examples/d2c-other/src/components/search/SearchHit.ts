import { BaseHit } from "instantsearch.js";

export interface SearchHit extends BaseHit {
  ep_amount: number;
  ep_categories: string[];
  ep_description: string;
  ep_name: string;
  ep_price: string;
  ep_sku: string;
  ep_slug: string;
  ep_main_image_url: string;
  objectID: string;
}
