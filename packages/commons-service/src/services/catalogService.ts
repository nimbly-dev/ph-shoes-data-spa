import axios, { AxiosInstance } from 'axios';
import { ProductShoe } from '../types/ProductShoe';
import { Page } from '../types/Page';
import { UIProductFilters } from '../types/UIProductFilters';
import { LatestData } from '../types/LatestData';

const env = (import.meta as any).env;

const catalogBaseURL = env.VITE_CATALOG_API_BASE_URL ?? env.VITE_API_BASE_URL;

if (!catalogBaseURL) {
  throw new Error('Catalog API base URL is not configured.');
}

const catalogClient: AxiosInstance = axios.create({
  baseURL: catalogBaseURL,
});

export async function fetchShoesByFilter(
  filters: UIProductFilters,
  page: number,
  size: number
): Promise<Page<ProductShoe>> {
  const params: Record<string, string | number | boolean> = {};

  if (filters.brand?.trim()) params.brand = filters.brand.trim();
  if (filters.gender?.trim()) params.gender = filters.gender.trim();

  if (filters.date?.trim()) {
    params.date = filters.date.trim();
  } else if (filters.startDate?.trim() && filters.endDate?.trim()) {
    const start = filters.startDate.trim();
    const end = filters.endDate.trim();

    const d = new Date(end);
    d.setDate(d.getDate() + 1);
    const endPlusOne =
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    params.startDate = start;
    params.endDate = endPlusOne;
  }

  if (filters.keyword?.trim()) params.keyword = filters.keyword.trim();
  if (filters.sizes?.length) params.sizes = filters.sizes.join(',');

  if (filters.minPrice != null) params.minPrice = Number(filters.minPrice);
  if (filters.maxPrice != null) params.maxPrice = Number(filters.maxPrice);
  if (filters.onSale === true) params.onSale = true;

  params.page = page;
  params.size = size;

  const response = await catalogClient.get<Page<ProductShoe>>('/api/v1/catalog-shoes', { params });
  return response.data;
}

interface RawLatestData {
  brand: string;
  latestDwid: string;
}

export async function fetchLatestShoeData(): Promise<LatestData[]> {
  const resp = await catalogClient.get<RawLatestData[]>('/api/v1/catalog-shoes/latest');

  return resp.data.map<LatestData>(({ brand, latestDwid }) => {
    const yyyy = latestDwid.slice(0, 4);
    const mm = latestDwid.slice(4, 6);
    const dd = latestDwid.slice(6, 8);
    const formatted = `${yyyy}-${mm}-${dd}`;

    return {
      brand,
      latestDate: formatted,
    };
  });
}

