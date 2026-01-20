export interface SilverPriceData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: number;
  source: string;
  conid?: number;
}

export interface SilverApiResponse {
  success: boolean;
  data: SilverPriceData;
  message?: string;
}
