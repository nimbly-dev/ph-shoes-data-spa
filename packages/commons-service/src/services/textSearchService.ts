import axios, { AxiosInstance } from 'axios';
import { Page } from '../types/Page';
import { ProductShoe } from '../types/ProductShoe';

const AI_QUERY_REGEX = /^[A-Za-z0-9\s!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/;
const env = (import.meta as any).env;

const catalogFallbackBaseURL = env.VITE_CATALOG_API_BASE_URL ?? env.VITE_API_BASE_URL;

if (!catalogFallbackBaseURL) {
  throw new Error('Catalog API base URL is not configured for text search fallback.');
}

const textSearchBaseURL = env.VITE_TEXT_SEARCH_API_BASE_URL ?? catalogFallbackBaseURL;

const textSearchClient: AxiosInstance = axios.create({
  baseURL: textSearchBaseURL,
});

export interface TextSearchHit {
  id?: string;
  brand?: string;
  title?: string;
  subtitle?: string;
  url?: string;
  image?: string;
  priceSale?: number;
  priceOriginal?: number;
  gender?: string;
  ageGroup?: string;
  sizes?: string[] | null;
  collectedDate?: string | null;
}

export interface TextSearchResults {
  content?: TextSearchHit[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface TextSearchResponse {
  filter: unknown;
  results: TextSearchResults;
}

export async function fetchShoesAI(
  nlQuery: string,
  page: number,
  size: number,
): Promise<TextSearchResponse> {
  if (!AI_QUERY_REGEX.test(nlQuery)) {
    return Promise.reject(new Error(
      'Your search contains invalid characters. Please use letters, numbers, and basic punctuation only.',
    ));
  }

  try {
    const response = await textSearchClient.get<TextSearchResponse>(
      '/search/fact-product-shoes',
      { params: { q: nlQuery, page, size } },
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      return Promise.reject(new Error(
        err.response.data?.message
          || 'Search query invalid. Please adjust and try again.',
      ));
    }
    return Promise.reject(err);
  }
}

export function adaptResponseToPage(
  data: TextSearchResponse,
  requestedPage: number,
  requestedSize: number
): Page<ProductShoe> {
  const results = data?.results ?? {};
  const hits = results.content ?? [];
  const content = mapHitsToProducts(hits);
  const sortMeta = { sorted: false, empty: true, unsorted: true };

  const pageNumber = results.page ?? requestedPage ?? 0;
  const pageSize = (results.size ?? requestedSize ?? content.length) || requestedSize;
  const totalElements = results.totalElements ?? content.length;
  const totalPages = results.totalPages ?? (pageSize ? Math.ceil(totalElements / pageSize) : 0);

  return {
    content,
    pageable: {
      pageNumber,
      pageSize,
      sort: sortMeta,
      offset: pageNumber * pageSize,
      paged: true,
      unpaged: false,
    },
    last: results.last ?? pageNumber >= totalPages - 1,
    totalPages,
    totalElements,
    size: pageSize,
    number: pageNumber,
    sort: sortMeta,
    first: results.first ?? pageNumber === 0,
    numberOfElements: content.length,
    empty: results.empty ?? content.length === 0,
  };
}

export function mapHitsToProducts(hits: TextSearchHit[]): ProductShoe[] {
  return hits.map((hit, idx) => mapHitToProduct(hit, idx));
}

export function mapHitToProduct(hit: TextSearchHit, idx: number): ProductShoe {
  const fallbackId = hit.id ?? `ai-${idx}-${Math.random().toString(36).slice(2)}`;
  const effectivePriceSale = typeof hit.priceSale === 'number'
    ? hit.priceSale
    : (typeof hit.priceOriginal === 'number' ? hit.priceOriginal : 0);
  const effectivePriceOriginal = typeof hit.priceOriginal === 'number'
    ? hit.priceOriginal
    : effectivePriceSale;
  const collectedDate = hit.collectedDate ?? undefined;
  const collectedParts = collectedDate ? collectedDate.split('-') : [];
  const collectedYear = collectedParts.length === 3 ? Number(collectedParts[0]) : undefined;
  const collectedMonth = collectedParts.length === 3 ? Number(collectedParts[1]) : undefined;
  const collectedDay = collectedParts.length === 3 ? Number(collectedParts[2]) : undefined;

  return {
    id: fallbackId,
    dwid: fallbackId,
    brand: hit.brand ?? 'unknown',
    title: hit.title ?? hit.subtitle ?? 'Unnamed product',
    subtitle: hit.subtitle ?? undefined,
    url: hit.url ?? '#',
    image: hit.image ?? undefined,
    priceSale: effectivePriceSale,
    priceOriginal: effectivePriceOriginal,
    gender: hit.gender ?? undefined,
    ageGroup: hit.ageGroup ?? undefined,
    sizes: hit.sizes ?? null,
    year: Number.isFinite(collectedYear) ? collectedYear : undefined,
    month: Number.isFinite(collectedMonth) ? collectedMonth : undefined,
    day: Number.isFinite(collectedDay) ? collectedDay : undefined,
  };
}
