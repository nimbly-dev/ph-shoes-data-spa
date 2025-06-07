
import { useState, useEffect } from 'react';
import { ProductShoe } from '../types/ProductShoe';
import { Page } from '../types/Page';
import { fetchShoesAI } from '../services/shoeService';

export interface UseShoesAIResult {
  data: Page<ProductShoe>;
  loading: boolean;
  error: any;
}

export const useShoesByAI = (
  nlQuery: string,
  page: number,
  size: number
): UseShoesAIResult => {
  const [data, setData] = useState<Page<ProductShoe>>({
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize: size,
      sort: { sorted: false, empty: true, unsorted: true },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: false,
    totalPages: 0,
    totalElements: 0,
    size: size,
    number: 0,
    sort: { sorted: false, empty: true, unsorted: true },
    first: true,
    numberOfElements: 0,
    empty: true,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!nlQuery.trim()) {
      setData((prev) => ({
        ...prev,
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true,
      }));
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchShoesAI(nlQuery.trim(), page, size)
      .then((resp: Page<ProductShoe>) => {
        setData(resp); 
      })
      .catch((err) => {
        setError(err);
        setData((prev) => ({
          ...prev,
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true,
        }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [nlQuery, page, size]);

  return { data, loading, error };
};
