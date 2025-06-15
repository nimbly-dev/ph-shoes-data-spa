// App.tsx

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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Brightness4, Brightness7, FilterList } from '@mui/icons-material';
import { ColorModeContext } from './themes/ThemeContext';
import { AISearch } from './components/AISearch/AISearch';
import { FilterControls } from './components/FilterControls/FilterControls';
import { ProductShoeList } from './components/ProductShoeList/ProductShoeList';
import { UIProductFilters } from './types/UIProductFilters';
import { LatestDataPopover } from './components/Toggles/LatestDataPopover';
import DataUsageIcon from '@mui/icons-material/DataUsage';

export default function App() {
  const { mode, toggleMode } = useContext(ColorModeContext);
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Adjust page size based on viewport
  const pageSize = isMobile ? 8 : 15;
  const [page, setPage] = useState(0);

  // Whenever pageSize changes (e.g. rotate device), reset to first page
  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const [searchMode, setSearchMode]   = useState<'ai' | 'manual'>('manual');
  const [aiQuery, setAiQuery]         = useState<string>('');
  const [aiTextInput, setAiTextInput] = useState<string>('');
  const [aiPage, setAiPage]           = useState(0);

  const today = new Date().toISOString().slice(0, 10); // “YYYY-MM-DD”
  const defaultFilters: UIProductFilters = {
    startDate: today,
    endDate:   today,
  };

  const [draftFilters, setDraftFilters]   = useState<UIProductFilters>({});
  const [activeFilters, setActiveFilters] = useState<UIProductFilters>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideFixedToggles = isMobile && drawerOpen;

  const [latestAnchor, setLatestAnchor] = useState<HTMLElement | null>(null);

  const handleModeToggle = (
    _: React.MouseEvent<HTMLElement>,
    nextMode: 'ai' | 'manual' | null
  ) => {
    if (!nextMode) return;
    if (nextMode === 'ai') {
      setActiveFilters({});
    } else {
      setAiQuery('');
      setAiTextInput('');
    }
    setSearchMode(nextMode);
    setPage(0);
  };

  const handleAiSearch = (nlQuery: string) => {
    if (nlQuery === aiQuery) {
      setAiQuery('');
      setTimeout(() => setAiQuery(nlQuery), 0);
    } else {
      setAiQuery(nlQuery);
    }
    setAiTextInput(nlQuery);
    setPage(0);
  };

  const handleAiClear = () => {
    setAiQuery('');
    setAiTextInput('');
    setPage(0);
  };

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
      {/* Theme & Latest-Data toggles */}
      {!hideFixedToggles && (
        <Box
          sx={{
            position: 'fixed',
            top:    (t) => t.spacing(2),
            right:  (t) => t.spacing(2),
            display: 'flex',
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

          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'light' ? <Brightness4/> : <Brightness7/>}
            </IconButton>
          </Tooltip>

          <LatestDataPopover
            anchorEl={latestAnchor}
            onClose={() => setLatestAnchor(null)}
          />
        </Box>
      )}

      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          PH-Shoes Catalog
        </Typography>

        {/* Mode Toggle */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={handleModeToggle}
            size="small"
          >
            <ToggleButton value="manual">Manual Filters</ToggleButton>
            <ToggleButton value="ai">AI Search</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* AI Search */}
        {searchMode === 'ai' && (
          <AISearch
            activeQuery={aiQuery}
            onSearch={handleAiSearch}
            onClear={handleAiClear}
          />
        )}

        {/* Manual Filters */}
        {searchMode === 'manual' && (
          <>
            {isMobile ? (
              <>
                <Button
                  startIcon={<FilterList />}
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mb: 2 }}
                >
                  Manual Filters
                </Button>
                <Drawer
                  anchor="right"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  ModalProps={{ keepMounted: true }}
                  PaperProps={{
                    sx: {
                      width: '80vw',
                      maxWidth: 300,
                      p: 2,
                      bgcolor: 'background.paper',
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Filters
                  </Typography>
                  <FilterControls
                    filters={draftFilters}
                    onChange={(newFilters) => setDraftFilters(newFilters)}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </Drawer>
              </>
            ) : (
              <Box mb={4}>
                <FilterControls
                  filters={draftFilters}
                  onChange={(newFilters) => setDraftFilters(newFilters)}
                />
                <Box display="flex" justifyContent="center" gap={2} mt={1}>
                  <Button variant="contained" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outlined" onClick={handleResetFilters}>
                    Reset
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Product List */}
        <ProductShoeList
          aiQuery={aiQuery}
          manualFilters={activeFilters}
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Container>
    </>
  );
}
