export interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
}

export interface StripePricesResponse {
  object: string;
  data: StripePrice[];
}
