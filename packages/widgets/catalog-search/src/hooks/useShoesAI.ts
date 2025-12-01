import { useState, useEffect } from 'react';
import { Page } from '@commons/types/Page';
import { ProductShoe } from '@commons/types/ProductShoe';
import { fetchShoesAI, adaptResponseToPage, TextSearchResponse } from '@commons/services/textSearchService';

export interface UseShoesAIResult {
  data: Page<ProductShoe>;
  loading: boolean;
  error: any;
  rawResponse?: TextSearchResponse;
}

export const useShoesByAI = (
  nlQuery: string,
  page: number,
  size: number,
  useVector: boolean    // ← still accepted, but NOT in deps
): UseShoesAIResult => {
  const [data, setData]       = useState<Page<ProductShoe>>({
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize:   size,
      sort:       { sorted: false, empty: true, unsorted: true },
      offset:     0,
      paged:      true,
      unpaged:    false,
    },
    last:             false,
    totalPages:       0,
    totalElements:    0,
    size,
    number:           0,
    sort:             { sorted: false, empty: true, unsorted: true },
    first:            true,
    numberOfElements: 0,
    empty:            true,
  });
  const [loading, setLoading]        = useState<boolean>(false);
  const [error, setError]            = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<TextSearchResponse | undefined>(undefined);

  useEffect(() => {
    if (!nlQuery.trim()) {
      // Reset if the query is empty
      setData((d) => ({ ...d, content: [], totalElements: 0, totalPages: 0, number: 0, first: true, last: true, empty: true }));
      setError(null);
      setRawResponse(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Calls fetchShoesAI with the current useVector value
    fetchShoesAI(nlQuery.trim(), page, size, useVector)
      .then((response) => {
        setRawResponse(response);
        const normalized = adaptResponseToPage(response, page, size);
        setData(normalized);
      })
      .catch((e) => {
        setError(e);
        setData((d) => ({ ...d, content: [], totalElements: 0, totalPages: 0, number: 0, first: true, last: true, empty: true }));
        setRawResponse(undefined);
      })
      .finally(() => setLoading(false));
  }, [
    nlQuery,  // ← only retrigger when query, page or size changes
    page,
    size,
    // NOTE: useVector is intentionally omitted
  ]);

  return { data, loading, error, rawResponse };
};
