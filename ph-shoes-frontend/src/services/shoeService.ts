import axios, { AxiosInstance } from 'axios';
import { ProductShoe } from '../types/ProductShoe';
import { Page } from '../types/Page';
import { ProductSearchFilter } from '../types/ProductSearchFilter';
import { UIProductFilters } from '../types/UIProductFilters';
import { LatestData } from '../types/LatestData';

const AI_QUERY_REGEX = /^[A-Za-z0-9\s!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/;
const client: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL,
});

// Manual filters endpoint
export async function fetchShoesByFilter(
  filters: UIProductFilters,
  page: number,
  size: number
): Promise<Page<ProductShoe>> {

  const params: Record<string, string | number | boolean> = {};

  if (filters.brand?.trim()) {
    params.brand = filters.brand.trim();
  }

  if (filters.gender?.trim()) {
    params.gender = filters.gender.trim();
  }

  if (filters.date?.trim()) {
    params.date = filters.date.trim();
  } else if (filters.startDate?.trim() && filters.endDate?.trim()) {
    params.startDate = filters.startDate.trim();
    params.endDate   = filters.endDate.trim();
  }

  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim();
  }

  if (filters.sizes && filters.sizes.length > 0) {
    params.sizes = filters.sizes.join(','); // comma-separated
  }

  if (filters.minPrice != null) params.minPrice = Number(filters.minPrice);
  if (filters.maxPrice != null) params.maxPrice = Number(filters.maxPrice);

  if (filters.onSale === true) {
    params.onSale = true; 
  }

  params.page = page;
  params.size = size;

  const response = await client.get<Page<ProductShoe>>(
    '/api/v1/fact-product-shoes',
    { params }
  );

  return response.data;
}




export async function fetchShoesAI(
  nlQuery: string,
  page: number,
  size: number,
  useVector: boolean
): Promise<Page<ProductShoe>> {
  if (!AI_QUERY_REGEX.test(nlQuery)) {
    return Promise.reject(new Error(
      'Your search contains invalid characters. Please use letters, numbers, and basic punctuation only.'
    ));
  }

  try {
    const response = await client.get<Page<ProductShoe>>(
      '/api/v1/fact-product-shoes/search',
      { params: { q: nlQuery, page, size, useVector: useVector } }
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      return Promise.reject(new Error(
        err.response.data?.message
          || 'Search query invalid. Please adjust and try again.'
      ));
    }
    return Promise.reject(err);
  }
}

interface RawLatestData {
  brand:      string;
  latestDwid: string;   
}

export async function fetchLatestShoeData(): Promise<LatestData[]> {
  const resp = await client.get<RawLatestData[]>("/api/v1/fact-product-shoes/latest");

  return resp.data.map<LatestData>(({ brand, latestDwid }) => {
    const yyyy = latestDwid.slice(0, 4);
    const mm   = latestDwid.slice(4, 6);
    const dd   = latestDwid.slice(6, 8);
    const formatted = `${yyyy}-${mm}-${dd}`;

    return {
      brand,
      latestDate: formatted
    };
  });
}