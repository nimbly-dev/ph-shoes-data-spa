export type AlertStatus = 'ACTIVE' | 'TRIGGERED' | 'PAUSED';

export interface AlertResponse {
  productId: string;
  userId: string;
  productName: string;
  productBrand?: string;
  productImage?: string;
  productImageUrl?: string;
  productUrl?: string;
  productOriginalPrice?: number;
  productCurrentPrice?: number;
  desiredPrice?: number;
  desiredPercent?: number;
  alertIfSale?: boolean;
  channels?: string[];
  status: AlertStatus;
  lastTriggeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlertCreateRequest {
  productId: string;
  productName: string;
  productBrand?: string;
  productImage?: string;
  productImageUrl?: string;
  productUrl?: string;
  productCurrentPrice: number;
  productOriginalPrice?: number;
  desiredPrice?: number;
  desiredPercent?: number;
  alertIfSale?: boolean;
  channels?: string[];
}

export interface AlertUpdateRequest extends AlertCreateRequest {
  resetStatus?: boolean;
}

export interface AlertTarget {
  id: string;
  title: string;
  priceSale: number;
  priceOriginal: number;
  brand?: string;
  image?: string;
  productImageUrl?: string;
  url?: string;
}
