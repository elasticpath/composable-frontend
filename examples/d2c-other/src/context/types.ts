import { ReactNode } from "react";

export interface Address {
  email?: string;
  first_name?: string;
  last_name?: string;
  line_1?: string;
  line_2?: string;
  city?: string;
  county?: string;
  country?: string;
  postcode?: string;
  phone_number?: string;
  instructions?: string;
}

export type ProviderProps = { children: ReactNode };
