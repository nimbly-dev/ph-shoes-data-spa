/**
 * This interface must exactly match what your backend's Java
 * ProductSearchFilter DTO expects. It must allow null for any field
 * (because the AI may produce `"brand": null`, etc.), and must be
 * optional so that a manual caller can omit fields.
 */
export interface ProductSearchFilter {
  /** “nike”, “adidas”, or null if not specified */
  brand?: string | null;

  /** “male”, “female”, “unisex” or null */
  gender?: string | null;

  /** “adult”, “kid”, “toddler” or null */
  ageGroup?: string | null;

  /** Minimum sale price, or null to ignore */
  priceSaleMin?: number | null;
  priceSaleMax?: number | null;
  priceOriginalMin?: number | null;
  priceOriginalMax?: number | null;

  /** Year/month/day or null to ignore */
  year?: number | null;
  month?: number | null;
  day?: number | null;

  /** Array of strings or null */
  titleKeywords?: string[] | null;
  subtitleKeywords?: string[] | null;

  /** (Optional) If you do need to pass page/size in the body instead of query params */
  page?: number;
  size?: number;
}
