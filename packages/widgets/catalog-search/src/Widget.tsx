import React from 'react';
import {
  Box,
  Button,
  Drawer,
  Paper,
  Typography,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { FilterSidebars } from './components/Filters/FilterSidebars';
import { ProductShoeList } from './components/ProductShoeList/ProductShoeList';
import { CatalogSearchWidgetProps } from './types/CatalogSearchWidgetProps';

export const CatalogSearchWidget: React.FC<CatalogSearchWidgetProps> = ({
  isMobile,
  drawerOpen,
  aiQuery,
  showingAI,
  draftFilters,
  activeFilters,
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
    page,
    pageSize,
    onPageChange,
    onOpenAlert,
    alertedProductIds,
  };

  return (
    <>
      {isMobile && (
        <Box
          sx={(theme) => ({
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar - 1,
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 2px 6px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.6 : 0.08})`,
            width: `calc(100% + ${theme.spacing(4)})`,
            ml: `-${theme.spacing(2)}`,
            mr: `-${theme.spacing(2)}`,
            px: theme.spacing(2),
            py: 1,
            mb: 2,
          })}
        >
          <Button startIcon={<FilterList />} onClick={onOpenDrawer} fullWidth sx={{ borderRadius: 999 }}>
            Filters
          </Button>
        </Box>
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
