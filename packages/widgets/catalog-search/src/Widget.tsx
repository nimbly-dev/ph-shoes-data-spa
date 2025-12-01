import React from 'react';
import {
  Box,
  Button,
  Drawer,
  Paper,
  Typography,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { UIProductFilters } from '@commons/types/UIProductFilters';
import { ProductShoe } from '@commons/types/ProductShoe';
import { WidgetRuntimeProps } from '@widget-runtime';
import { FilterSidebars } from './components/Filters/FilterSidebars';
import { ProductShoeList } from './components/ProductShoeList/ProductShoeList';

export type CatalogSearchWidgetProps = WidgetRuntimeProps & {
  isMobile: boolean;
  drawerOpen: boolean;
  aiQuery: string;
  showingAI: boolean;
  draftFilters: UIProductFilters;
  activeFilters: UIProductFilters;
  useVector: boolean;
  page: number;
  pageSize: number;
  alertedProductIds: Set<string>;
  onOpenAlert: (shoe: ProductShoe) => void;
  onDraftChange: (next: UIProductFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  onPageChange: (page: number) => void;
};

export const CatalogSearchWidget: React.FC<CatalogSearchWidgetProps> = ({
  isMobile,
  drawerOpen,
  aiQuery,
  showingAI,
  draftFilters,
  activeFilters,
  useVector,
  page,
  pageSize,
  alertedProductIds,
  onOpenAlert,
  onDraftChange,
  onApplyFilters,
  onResetFilters,
  onOpenDrawer,
  onCloseDrawer,
  onPageChange,
}) => {
  const listProps = {
    aiQuery: showingAI ? aiQuery : '',
    manualFilters: showingAI ? {} : activeFilters,
    useVector,
    page,
    pageSize,
    onPageChange,
    onOpenAlert,
    alertedProductIds,
  };

  return (
    <>
      {isMobile && (
        <Button startIcon={<FilterList />} onClick={onOpenDrawer} sx={{ my: 2 }}>
          Filters
        </Button>
      )}

      {isMobile && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={onCloseDrawer}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: '80vw', maxWidth: 320, p: 2 } }}
        >
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <FilterSidebars
            draft={draftFilters}
            onDraftChange={onDraftChange}
            onApply={onApplyFilters}
            onReset={onResetFilters}
          />
        </Drawer>
      )}

      {!isMobile && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 360px) 1fr',
            gap: 4,
            alignItems: 'start',
          }}
        >
          <Box sx={{ position: 'sticky', top: 12, alignSelf: 'start' }}>
            <Paper elevation={1} sx={{ p: 2.25, borderRadius: 2 }}>
              <FilterSidebars draft={draftFilters} onDraftChange={onDraftChange} />
            </Paper>
          </Box>

          <Box>
            <ProductShoeList {...listProps} />
          </Box>
        </Box>
      )}

      {isMobile && <ProductShoeList {...listProps} />}
    </>
  );
};

export default CatalogSearchWidget;
