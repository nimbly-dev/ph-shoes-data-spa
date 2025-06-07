// src/hooks/useShoesByFilter.ts

import { useState, useEffect } from 'react';
import { UIProductFilters } from '../types/UIProductFilters';
import { ProductShoe } from '../types/ProductShoe';
import { Page } from '../types/Page';
import { fetchShoesByFilter } from '../services/shoeService';

export interface UseShoesByFilterResult {
  data: Page<ProductShoe>;
  loading: boolean;
  error: any;
}

export const useShoesByFilter = (
  filters: UIProductFilters,
  page: number,   // zero-based
  size: number
): UseShoesByFilterResult => {
  // 1) Build a default “empty” page that matches your Page<T> interface
  const defaultPage: Page<ProductShoe> = {
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize: size,
      sort: { sorted: false, empty: true, unsorted: true },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalPages: 0,
    totalElements: 0,
    size: size,
    number: 0,             
    sort: { sorted: false, empty: true, unsorted: true },
    first: true,
    numberOfElements: 0,
    empty: true,
  };

  const [data, setData] = useState<Page<ProductShoe>>(defaultPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchShoesByFilter(filters, page, size)
      .then((pageResult) => {
        setData(pageResult);
      })
      .catch((err) => {
        setError(err);
        setData(defaultPage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, page, size]);

  return { data, loading, error };
};
