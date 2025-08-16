// src/App.tsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Drawer,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';

import TopNav from './components/Header/TopNav';
// NOTE: we no longer render AISearch here (TopNav already includes it)
import { FilterSidebars } from './components/Filters/FilterSidebars';
import { ProductShoeList } from './components/ProductShoeList/ProductShoeList';
import { ToggleSettingsModal } from './components/Toggles/ToggleSettingsModal';

import { ColorModeContext } from './themes/ThemeContext';
import { UIProductFilters } from './types/UIProductFilters';

export default function App() {
  const { mode, toggleMode } = useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ---------- paging ----------
  const pageSize = isMobile ? 8 : 15;
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [pageSize]);

  // ---------- sensible default date window: yesterday → today ----------
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const defaultFilters: UIProductFilters = useMemo(
    () => ({
      brand: 'newbalance',
      startDate: yesterdayStr,
      endDate: todayStr,
    }),
    [yesterdayStr, todayStr]
  );

  // ---------- manual filters state ----------
  const [draftFilters, setDraftFilters] = useState<UIProductFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<UIProductFilters>(defaultFilters);

  // ---------- AI search ----------
  const [aiQuery, setAiQuery] = useState<string>('');
  const showingAI = aiQuery.trim().length > 0;

  // ---------- UI ----------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [useVectorFallback, setUseVectorFallback] = useState(true);

  // ---------- Desktop: auto-apply draft → active with debounce ----------
  const autoApply = !isMobile;
  useEffect(() => {
    if (!autoApply) return;
    const id = window.setTimeout(() => {
      setActiveFilters({ ...draftFilters });
      setPage(0);
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftFilters, autoApply]);

  // ---------- AI search handlers (TopNav calls these) ----------
  const handleAiSearch = (nlQuery: string) => {
    if (nlQuery === aiQuery) {
      setAiQuery('');
      setTimeout(() => setAiQuery(nlQuery), 0);
    } else {
      setAiQuery(nlQuery);
    }
    setPage(0);
  };

  const handleAiClear = () => {
    setAiQuery('');
    setPage(0);
  };

  // ---------- Mobile drawer actions ----------
  const handleApplyFilters = () => {
    setActiveFilters({ ...draftFilters });
    setPage(0);
    setDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setDraftFilters({ ...defaultFilters });
    setActiveFilters({ ...defaultFilters });
    setPage(0);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Sticky header with compact search + icons */}
      <TopNav
        mode={mode}
        onToggleMode={toggleMode}
        activeQuery={aiQuery}
        onSearch={handleAiSearch}
        onClear={handleAiClear}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenNotifications={() => {
          /* stub for notifications popover */
        }}
        onOpenAccount={() => {
          /* stub for account menu */
        }}
        unread={3}
      />

      {/* Settings modal */}
      <ToggleSettingsModal
        open={settingsOpen}
        useVector={useVectorFallback}
        onChange={setUseVectorFallback}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Page body (no duplicate title/search here) */}
      <Container disableGutters maxWidth={false} sx={{ width: '100%' }}>
        <Box
          sx={{
            maxWidth: '1680px',
            mx: 'auto',
            px: { xs: 2, md: 3 },
            pt: 3,
            pb: 4,
          }}
        >
          {/* MOBILE: filter drawer trigger */}
          {isMobile && (
            <Button
              startIcon={<FilterList />}
              onClick={() => setDrawerOpen(true)}
              sx={{ my: 2 }}
            >
              Filters
            </Button>
          )}

          {/* MOBILE: drawer */}
          {isMobile && (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: '80vw', maxWidth: 320, p: 2 } }}
            >
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <FilterSidebars
                draft={draftFilters}
                onDraftChange={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </Drawer>
          )}

          {/* DESKTOP: two-column layout with sticky filters */}
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
                  <FilterSidebars draft={draftFilters} onDraftChange={setDraftFilters} />
                </Paper>
              </Box>

              <Box>
                <ProductShoeList
                  aiQuery={showingAI ? aiQuery : ''}
                  manualFilters={showingAI ? {} : activeFilters}
                  useVector={useVectorFallback}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </Box>
            </Box>
          )}

          {/* MOBILE: full-width grid */}
          {isMobile && (
            <ProductShoeList
              aiQuery={showingAI ? aiQuery : ''}
              manualFilters={showingAI ? {} : activeFilters}
              useVector={useVectorFallback}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </Box>
      </Container>
    </>
  );
}
