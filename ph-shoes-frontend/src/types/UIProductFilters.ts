export interface UIProductFilters {
  brand?: string;
  gender?: string;
  date?: string;         // ISO yyyy-MM-dd
  startDate?: string;    // ISO yyyy-MM-dd
  endDate?: string;      // ISO yyyy-MM-dd
  keyword?: string;      // ← New
  onSale?: boolean;      // ← New
}