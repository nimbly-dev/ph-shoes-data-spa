import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UIProductFilters } from '@commons/types/UIProductFilters';

export type ProductSearchControls = {
  draftFilters: UIProductFilters;
  activeFilters: UIProductFilters;
  aiQuery: string;
  showingAI: boolean;
  page: number;
  pageSize: number;
  drawerOpen: boolean;
  handleDraftChange: (next: UIProductFilters) => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  handleAiSearch: (query: string) => void;
  handleAiClear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setPage: Dispatch<SetStateAction<number>>;
};

const fmtLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function useProductSearchControls(isMobile: boolean): ProductSearchControls {
  const [desktopPageSize, setDesktopPageSize] = useState(18);

  const computeDesktopPageSize = useCallback(() => {
    if (typeof window === 'undefined') return 18;
    const filterColumnWidth = 420;
    const horizontalGutters = 32;
    const minCardWidth = 220;
    const gridGap = 20;
    const gridElement = document.querySelector('section');
    const gridAvailableWidth = gridElement
      ? gridElement.getBoundingClientRect().width
      : Math.max(0, window.innerWidth - filterColumnWidth - horizontalGutters);
    const columns = Math.max(2, Math.floor((gridAvailableWidth + gridGap) / (minCardWidth + gridGap)));
    const gridTop = document.querySelector('section')?.getBoundingClientRect().top ?? 0;
    const paginationReserve = 140;
    const cardHeightEstimate = 420;
    const availableHeight = Math.max(0, window.innerHeight - gridTop - paginationReserve);
    const rows = Math.max(2, Math.floor(availableHeight / (cardHeightEstimate + gridGap)));
    return columns * rows;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updatePageSize = () => setDesktopPageSize(computeDesktopPageSize());
    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    let observer: ResizeObserver | null = null;
    const gridElement = document.querySelector('section');
    if (gridElement && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updatePageSize);
      observer.observe(gridElement);
    }
    return () => window.removeEventListener('resize', updatePageSize);
  }, [computeDesktopPageSize]);

  const pageSize = isMobile ? 8 : desktopPageSize;
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [pageSize]);

  const todayStr = useMemo(() => fmtLocal(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return fmtLocal(d);
  }, []);

  const defaultFilters: UIProductFilters = useMemo(
    () => ({
      startDate: yesterdayStr,
      endDate: todayStr,
    }),
    [yesterdayStr, todayStr]
  );

  const [draftFilters, setDraftFilters] = useState<UIProductFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<UIProductFilters>(defaultFilters);
  const [aiQuery, setAiQuery] = useState<string>('');
  const showingAI = aiQuery.trim().length > 0;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const suppressManualChangeRef = useRef(false);
  const releaseManualChangeTimeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (releaseManualChangeTimeout.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(releaseManualChangeTimeout.current);
    }
  }, []);

  const releaseManualChangeGuard = useCallback(() => {
    if (releaseManualChangeTimeout.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(releaseManualChangeTimeout.current);
    }
    if (typeof window === 'undefined') {
      suppressManualChangeRef.current = false;
      releaseManualChangeTimeout.current = null;
      return;
    }
    releaseManualChangeTimeout.current = window.setTimeout(() => {
      suppressManualChangeRef.current = false;
      releaseManualChangeTimeout.current = null;
    }, 50);
  }, []);

  const clearManualFiltersProgrammatically = useCallback((next: UIProductFilters = {}) => {
    suppressManualChangeRef.current = true;
    setDraftFilters(next);
    setActiveFilters(next);
    releaseManualChangeGuard();
  }, [releaseManualChangeGuard]);

  useEffect(() => {
    if (isMobile) return;
    const id = window.setTimeout(() => {
      setActiveFilters({ ...draftFilters });
      setPage(0);
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftFilters, isMobile]);

  const handleAiSearch = useCallback(
    (nlQuery: string) => {
      clearManualFiltersProgrammatically({});
      if (nlQuery === aiQuery) {
        setAiQuery('');
        setTimeout(() => setAiQuery(nlQuery), 0);
      } else {
        setAiQuery(nlQuery);
      }
      setPage(0);
    },
    [aiQuery, clearManualFiltersProgrammatically]
  );

  const handleAiClear = useCallback(() => {
    setAiQuery('');
    setPage(0);
  }, []);

  const handleDraftChange = useCallback(
    (next: UIProductFilters) => {
      if (!suppressManualChangeRef.current && aiQuery) setAiQuery('');
      setDraftFilters(next);
      setPage(0);
    },
    [aiQuery]
  );

  const handleApplyFilters = useCallback(() => {
    if (aiQuery) setAiQuery('');
    setActiveFilters({ ...draftFilters });
    setPage(0);
    setDrawerOpen(false);
  }, [aiQuery, draftFilters]);

  const handleResetFilters = useCallback(() => {
    if (aiQuery) setAiQuery('');
    setDraftFilters({ ...defaultFilters });
    setActiveFilters({ ...defaultFilters });
    setPage(0);
    setDrawerOpen(false);
  }, [aiQuery, defaultFilters]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  return {
    draftFilters,
    activeFilters,
    aiQuery,
    showingAI,
    page,
    pageSize,
    drawerOpen,
    handleDraftChange,
    handleApplyFilters,
    handleResetFilters,
    handleAiSearch,
    handleAiClear,
    openDrawer,
    closeDrawer,
    setPage,
  };
}
