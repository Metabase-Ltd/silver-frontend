export interface SilverPriceData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: number;
  source: string;
}

export interface SilverApiResponse {
  success: boolean;
  data: SilverPriceData;
  message?: string;
}
