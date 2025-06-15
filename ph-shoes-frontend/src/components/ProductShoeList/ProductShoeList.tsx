// src/components/ProductShoeList/ProductShoeList.tsx

import React from 'react';
import { Box, Pagination, CircularProgress, Typography } from '@mui/material';
import { useShoesByAI } from '../../hooks/useShoesAI';
import { useShoesByFilter, UseShoesByFilterResult } from '../../hooks/useShoesByFilter';
import { ProductShoeItem } from './ProductShoeItem';
import { ProductShoe } from '../../types/ProductShoe';
import { UIProductFilters } from '../../types/UIProductFilters';

interface Props {
  aiQuery: string;
  manualFilters: UIProductFilters;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export const ProductShoeList: React.FC<Props> = ({
  aiQuery,
  manualFilters,
  page,
  pageSize,
  onPageChange,
}) => {
  // 1) AI hook
  const {
    data: aiData,
    loading: loadingAi,
    error: errorAi,
  } = useShoesByAI(aiQuery, page, pageSize);

  // 2) Manual hook
  const {
    data: manualData,
    loading: loadingManual,
    error: errorManual,
  }: UseShoesByFilterResult = useShoesByFilter(manualFilters, page, pageSize);

  const isAiMode = aiQuery.trim() !== '';
  const pageData = isAiMode ? aiData : manualData;
  const loading = isAiMode ? loadingAi : loadingManual;
  const error = isAiMode ? errorAi : errorManual;

  const contentArray: ProductShoe[] = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = pageData?.number ?? page; 

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={8}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {isAiMode ? 'Loading AI results…' : 'Loading shoes…'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" variant="h6" my={8}>
        Error loading shoes: {error?.message ?? String(error)}
      </Typography>
    );
  }

  if (!loading && contentArray.length === 0) {
    return (
      <Box textAlign="center" my={8}>
        <Typography variant="h6">
          {isAiMode
            ? `No AI results found for “${aiQuery}”`
            : 'No shoes match these filters.'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        component="section"
        sx={{
          display: 'grid',
          gap: 4,
          justifyContent: 'center',
          justifyItems: 'center',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
        }}
      >
        {contentArray.map((shoe: ProductShoe) => (
          <ProductShoeItem key={`${shoe.dwid}-${shoe.id}`} shoe={shoe} />
        ))}
      </Box>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={currentPage + 1} 
          onChange={(_, newPage) => onPageChange(newPage - 1)}
          shape="rounded"
        />
      </Box>
    </>
  );
};
