// src/services/shoeService.ts

import axios, { AxiosInstance } from 'axios';
import { ProductShoe } from '../types/ProductShoe';
import { Page } from '../types/Page';
import { ProductSearchFilter } from '../types/ProductSearchFilter';
import { UIProductFilters } from '../types/UIProductFilters';
import { LatestData } from '../types/LatestData';

const AI_QUERY_REGEX = /^[A-Za-z0-9\s!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/;
const client: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL, 
  // Remove or increase timeout if needed:
  // timeout: 20000,
});


export interface AiPageResponse {
  filter: ProductSearchFilter;   // The AI‐computed filter
  results: Page<ProductShoe>;     // The actual paged shoes
}

// MANUAL GET:
export async function fetchShoesByFilter(
  filters: UIProductFilters,
  page: number,
  size: number
): Promise<Page<ProductShoe>> {
  // Collect all query‐params into a flat object
  const params: Record<string, string | number> = {};

  // Always include any dropdown filters
  if (filters.brand)    params.brand = filters.brand;
  if (filters.gender)   params.gender = filters.gender;

  // Date vs. Date‐Range logic
  if (filters.date) {
    params.date = filters.date;
  } else if (filters.startDate && filters.endDate) {
    params.startDate = filters.startDate;
    params.endDate   = filters.endDate;
  }

  // Keyword filter (was missing)
  if (filters.keyword) {
    params.keyword = filters.keyword;
  }

  // “On Sale Only” filter (the key fix: only append when true)
  if (filters.onSale === true) {
    params.onSale = 'true';
  }

  // Pagination
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
  size: number
): Promise<Page<ProductShoe>> {
  if (!AI_QUERY_REGEX.test(nlQuery)) {
    return Promise.reject(new Error(
      'Your search contains invalid characters. Please use letters, numbers, and basic punctuation only.'
    ));
  }

  try {
    const response = await client.get<Page<ProductShoe>>(
      '/api/v1/fact-product-shoes/search',
      { params: { q: nlQuery, page, size } }
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

export async function fetchLatestShoeData(): Promise<LatestData[]> {
  const resp = await client.get<LatestData[]>('/api/v1/fact-product-shoes/latest');
  return resp.data;
}