import { WidgetRuntimeProps } from '@widget-runtime';
import { UIProductFilters } from '@commons/types/UIProductFilters';
import { ProductShoe } from '@commons/types/ProductShoe';

export type CatalogSearchWidgetProps = WidgetRuntimeProps & {
  isMobile: boolean;
  drawerOpen: boolean;
  aiQuery: string;
  showingAI: boolean;
  draftFilters: UIProductFilters;
  activeFilters: UIProductFilters;
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
