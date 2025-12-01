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
  settingsOpen: boolean;
  useVectorFallback: boolean;
  handleDraftChange: (next: UIProductFilters) => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  handleAiSearch: (query: string) => void;
  handleAiClear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setUseVectorFallback: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<number>>;
};

const fmtLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function useProductSearchControls(isMobile: boolean): ProductSearchControls {
  const pageSize = isMobile ? 8 : 15;
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [useVectorFallback, setUseVectorFallback] = useState(false);

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
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  return {
    draftFilters,
    activeFilters,
    aiQuery,
    showingAI,
    page,
    pageSize,
    drawerOpen,
    settingsOpen,
    useVectorFallback,
    handleDraftChange,
    handleApplyFilters,
    handleResetFilters,
    handleAiSearch,
    handleAiClear,
    openDrawer,
    closeDrawer,
    openSettings,
    closeSettings,
    setUseVectorFallback,
    setPage,
  };
}
