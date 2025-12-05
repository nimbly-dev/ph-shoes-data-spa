import React, { useMemo } from 'react';
import { Box, Pagination, CircularProgress, Typography } from '@mui/material';
import { useShoesByFilter, UseShoesByFilterResult } from '../../hooks/useShoesByFilter';
import { ProductShoeItem } from './ProductShoeItem';
import { UIProductFilters } from '@commons/types/UIProductFilters';
import { useShoesByAI } from '../../hooks/useShoesAI';
import { mapHitsToProducts } from '@commons/services/textSearchService';
import type { ProductShoe } from '@commons/types/ProductShoe';

interface Props {
  aiQuery: string;
  manualFilters: UIProductFilters;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onOpenAlert?: (shoe: ProductShoe) => void;
  alertedProductIds?: Set<string>;
}

export const ProductShoeList: React.FC<Props> = ({
  aiQuery,
  manualFilters,
  page,
  pageSize,
  onPageChange,
  onOpenAlert,
  alertedProductIds,
}) => {
  const {
    data: aiData,
    loading: loadingAi,
    error: errorAi,
    rawResponse: aiRaw,
  } =
    useShoesByAI(aiQuery, page, pageSize);

  const { data: manualData, loading: loadingManual, error: errorManual }:
    UseShoesByFilterResult = useShoesByFilter(manualFilters, page, pageSize);

  const isAiMode     = aiQuery.trim() !== '';
  const pageData     = isAiMode ? aiData : manualData;
  const loading      = isAiMode ? loadingAi : loadingManual;
  const error        = isAiMode ? errorAi   : errorManual;
  const manualContent = pageData?.content ?? [];
  const aiHits = aiRaw?.results?.content ?? [];
  const aiContent = useMemo(() => mapHitsToProducts(aiHits), [aiHits]);

  // Prefer AI hits when in AI mode and hits exist; otherwise fall back to the normalized page.
  const displayContent = isAiMode
    ? (aiContent.length > 0 ? aiContent : manualContent)
    : manualContent;

  const totalPages = isAiMode
    ? (aiRaw?.results?.totalPages ?? pageData?.totalPages ?? 0)
    : (pageData?.totalPages ?? 0);
  const currentPage = isAiMode
    ? (aiRaw?.results?.page ?? pageData?.number ?? page)
    : (pageData?.number ?? page);

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

  if (!loading && displayContent.length === 0) {
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
        {displayContent.map((shoe, idx) => {
          const stableKey = shoe.dwid ?? shoe.id ?? `${shoe.title}-${idx}`;
          return (
            <ProductShoeItem
              key={stableKey}
              shoe={shoe}
              onAlert={onOpenAlert}
              isAlerted={alertedProductIds?.has(shoe.id)}
            />
          );
        })}
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
