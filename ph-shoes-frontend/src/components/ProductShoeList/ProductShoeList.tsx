import React from 'react';
import { Box, Pagination, CircularProgress, Typography } from '@mui/material';
import { useShoesByFilter, UseShoesByFilterResult } from '../../hooks/useShoesByFilter';
import { ProductShoeItem } from './ProductShoeItem';
import { UIProductFilters } from '../../types/UIProductFilters';
import { useShoesByAI } from '../../hooks/useShoesAI';

interface Props {
  aiQuery: string;
  manualFilters: UIProductFilters;
  useVector: boolean;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onOpenAlert?: (shoe: import('../../types/ProductShoe').ProductShoe) => void;
  alertedProductIds?: Set<string>;
}

export const ProductShoeList: React.FC<Props> = ({
  aiQuery,
  manualFilters,
  useVector,
  page,
  pageSize,
  onPageChange,
  onOpenAlert,
  alertedProductIds,
}) => {
  const { data: aiData, loading: loadingAi, error: errorAi } =
    useShoesByAI(aiQuery, page, pageSize, useVector);

  const { data: manualData, loading: loadingManual, error: errorManual }:
    UseShoesByFilterResult = useShoesByFilter(manualFilters, page, pageSize);

  const isAiMode     = aiQuery.trim() !== '';
  const pageData     = isAiMode ? aiData : manualData;
  const loading      = isAiMode ? loadingAi : loadingManual;
  const error        = isAiMode ? errorAi   : errorManual;
  const contentArray = pageData?.content ?? [];
  const totalPages   = pageData?.totalPages ?? 0;
  const currentPage  = pageData?.number     ?? page;

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
          {isAiMode ? `No AI results found for “${aiQuery}”` : 'No shoes match these filters.'}
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
          gap: { xs: 2, md: 2.5 },            
          alignItems: 'stretch',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(auto-fill, minmax(220px, 1fr))',
          },
        }}
      >
        {contentArray.map((shoe) => (
          <ProductShoeItem
            key={`${shoe.dwid}-${shoe.id}`}
            shoe={shoe}
            onAlert={onOpenAlert}
            isAlerted={alertedProductIds?.has(shoe.id)}
          />
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
