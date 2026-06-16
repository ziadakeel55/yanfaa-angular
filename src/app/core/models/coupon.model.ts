export interface Coupon {
  code: string;
  discountPercent: number;
  discountAmount?: number;
  validUntil?: string;
  isActive: boolean;
  applicablePlans?: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  message: string;
}
