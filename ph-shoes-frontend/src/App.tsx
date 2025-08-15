// src/App.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import { Brightness4, Brightness7, FilterList, Settings } from '@mui/icons-material';
import DataUsageIcon from '@mui/icons-material/DataUsage';

import { ColorModeContext } from './themes/ThemeContext';
import { AISearch } from './components/AISearch/AISearch';
import { FilterSidebars } from './components/Filters/FilterSidebars';
import { ProductShoeList } from './components/ProductShoeList/ProductShoeList';
import { LatestDataPopover } from './components/Toggles/LatestDataPopover';
import { UIProductFilters } from './types/UIProductFilters';
import { fetchLatestShoeData } from './services/shoeService';
import { LatestData } from './types/LatestData';
import { ToggleSettingsModal } from './components/Toggles/ToggleSettingsModal';

export default function App() {
  const { mode, toggleMode } = useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ---- paging (kept as‑is) ----
  const pageSize = isMobile ? 8 : 15;
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [pageSize]);

  // ---- latest data badge ----
  const [latestData, setLatestData] = useState<LatestData[] | null>(null);
  useEffect(() => { fetchLatestShoeData().then(setLatestData).catch(console.error); }, []);

  // ---- sensible default date window: yesterday → today ----
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr     = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const defaultFilters: UIProductFilters = {
    brand:     'newbalance',
    startDate: yesterdayStr,
    endDate:   todayStr,
  };

  // ---- filter state ----
  const [draftFilters, setDraftFilters]   = useState<UIProductFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<UIProductFilters>(defaultFilters);

  // ---- AI search state (always visible now) ----
  const [aiQuery, setAiQuery]         = useState<string>('');
  const [aiTextInput, setAiTextInput] = useState<string>(''); // if your AISearch uses it
  const showingAI = aiQuery.trim().length > 0;

  // ---- UI state ----
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const hideFixedToggles                = isMobile && drawerOpen;
  const [latestAnchor, setLatestAnchor] = useState<HTMLElement | null>(null);

  // ---- search Settings ----
  const [settingsOpen, setSettingsOpen]           = useState(false);
  const [useVectorFallback, setUseVectorFallback] = useState(true);

  // ---- Desktop: auto‑apply draft → active with a small debounce ----
  const autoApply = !isMobile;  // desktop = true, mobile (drawer) = manual apply
  useEffect(() => {
    if (!autoApply) return;
    const id = window.setTimeout(() => {
      setActiveFilters({ ...draftFilters });
      setPage(0);
    }, 250); // debounce
    return () => window.clearTimeout(id);
  }, [draftFilters, autoApply]);

  // ---- AI search handlers (search bar lives under the title) ----
  const handleAiSearch = (nlQuery: string) => {
    setAiTextInput(nlQuery);
    // re-trigger if the same query is submitted again
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
    setAiTextInput('');
    setPage(0);
  };

  // ---- Manual Apply/Reset (used on mobile drawer, or if you force manual) ----
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
      {/* Fixed toggles: latest-data, settings, theme */}
      {!hideFixedToggles && (
        <Box
          sx={{
            position: 'fixed',
            top:      (t) => t.spacing(2),
            right:    (t) => t.spacing(2),
            display:  'flex',
            gap:      1,
            zIndex:   (t) => t.zIndex.tooltip,
          }}
        >
          <Tooltip title="Latest data by brand">
            <IconButton
              color="inherit"
              onClick={(e) => setLatestAnchor(a => a ? null : e.currentTarget)}
            >
              <DataUsageIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Search Settings">
            <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>

          <LatestDataPopover
            anchorEl={latestAnchor}
            onClose={() => setLatestAnchor(null)}
            data={latestData}
          />
        </Box>
      )}

      {/* Settings modal */}
      <ToggleSettingsModal
        open={settingsOpen}
        useVector={useVectorFallback}
        onChange={setUseVectorFallback}
        onClose={() => setSettingsOpen(false)}
      />

      {/* PAGE SHELL: full-bleed, inner centered wrapper with wide cap + small gutters */}
      <Container disableGutters maxWidth={false} sx={{ width: '100%' }}>
        <Box
          sx={{
            maxWidth: '1680px',
            mx: 'auto',
            px: { xs: 2, md: 3 },
            pt: 4,
            pb: 4,
          }}
        >
          {/* Title + BIG AI SEARCH */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              PH‑Shoes Catalog
            </Typography>

            {/* Always visible search bar (AI). If empty -> manual filters; else -> AI results */}
            <AISearch
              activeQuery={aiQuery}
              onSearch={handleAiSearch}
              onClear={handleAiClear}
              // placeholder="Search shoes, brands, colors, sizes…"
              // maxWidth={720}
            />


          </Box>

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

          {/* MOBILE: drawer with Apply/Reset */}
          {isMobile && (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: '80vw', maxWidth: 320, p: 2, bgcolor: 'background.paper' } }}
            >
              <Typography variant="h6" gutterBottom>Filters</Typography>
              <FilterSidebars
                draft={draftFilters}
                onDraftChange={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </Drawer>
          )}

          {/* DESKTOP: two-column layout with sticky left sidebar */}
          {!isMobile && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 360px) 1fr',
                gap: 4,
                alignItems: 'start',
              }}
            >
              {/* Left rail */}
              <Box sx={{ position: 'sticky', top: 12, alignSelf: 'start' }}>
                <Paper elevation={1} sx={{ p: 2.25, borderRadius: 2 }}>
                  <FilterSidebars
                    draft={draftFilters}
                    onDraftChange={setDraftFilters}
                    // no onApply/onReset -> auto-apply on desktop
                  />
                </Paper>
              </Box>

              {/* Right: product grid */}
              <Box>
                <ProductShoeList
                  aiQuery={showingAI ? aiQuery : ''}                 // AI results when query present
                  manualFilters={showingAI ? {} : activeFilters}      // Manual filters otherwise
                  useVector={useVectorFallback}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </Box>
            </Box>
          )}

          {/* MOBILE: product grid (full width) */}
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
