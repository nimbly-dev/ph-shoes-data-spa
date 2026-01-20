import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertsService } from '@commons/services/alertsService';
import { useAlerts } from '@commons/hooks/useAlerts';
import {
  AlertCreateRequest,
  AlertResponse,
  AlertTarget,
  AlertUpdateRequest,
} from '@commons/types/alerts';
import { AlertsDetailWidget } from '@widgets/alerts-detail';
import { AlertsModal } from './AlertsModal';
import { AlertsListWidgetProps } from './types/AlertsListWidgetProps';

const ALERTS_PAGE_SIZE = 8;

function normalizeAlertsList(alerts: AlertResponse[] | undefined | null): AlertResponse[] {
  if (!Array.isArray(alerts)) return [];
  return alerts;
}

const Widget: React.FC<AlertsListWidgetProps> = ({
  isAuthenticated,
  open,
  onClose,
  onOpen,
  alertRequest,
  onAlertRequestHandled,
  onAlertsChange,
}) => {
  const {
    alerts,
    loading: alertsLoading,
    triggeredCount,
    create: createAlert,
    update: updateAlert,
    remove: deleteAlert,
    refresh: refreshAlerts,
  } = useAlerts(isAuthenticated);

  const alertedProductIds = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.productId))),
    [alerts],
  );

  useEffect(() => {
    onAlertsChange?.(alerts, triggeredCount, alertedProductIds);
  }, [alerts, triggeredCount, alertedProductIds, onAlertsChange]);

  const baseAlerts = useMemo(() => normalizeAlertsList(alerts), [alerts]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<AlertResponse[]>(baseAlerts);
  const [viewLoading, setViewLoading] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AlertTarget | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertResponse | null>(null);
  const [returnToList, setReturnToList] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setView(baseAlerts);
      setTotalPages(1);
      setPage(1);
    }
  }, [baseAlerts, search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setPage(1);
      setTotalPages(1);
      setView(baseAlerts);
      setViewLoading(false);
    }
  }, [open, baseAlerts]);

  useEffect(() => {
    if (!alertRequest) return;
    setSelectedProduct(alertRequest.product);
    setSelectedAlert(alertRequest.existingAlert ?? null);
    setReturnToList(!!alertRequest.returnToList);
    setAlertModalOpen(true);
    onAlertRequestHandled?.();
  }, [alertRequest, onAlertRequestHandled]);

  const runSearch = useCallback(
    async (term: string, nextPage = 1) => {
      const trimmed = term.trim();
      setSearch(term);
      setPage(nextPage);
      if (!trimmed) {
        setView(baseAlerts);
        setTotalPages(1);
        return;
      }
      setViewLoading(true);
      try {
        const res: any = await AlertsService.search({
          q: trimmed,
          page: nextPage - 1,
          size: ALERTS_PAGE_SIZE,
        });
        const content = normalizeAlertsList(res?.content);
        setView(content);
        setTotalPages(typeof res?.totalPages === 'number' ? res.totalPages : 1);
      } finally {
        setViewLoading(false);
      }
    },
    [baseAlerts],
  );

  const handleClose = () => onClose();

  const handleEdit = (alert: AlertResponse) => {
    onClose();
    setSelectedProduct(buildAlertTarget(alert));
    setSelectedAlert(alert);
    setReturnToList(true);
    setAlertModalOpen(true);
  };

  const handleDelete = async (alert: AlertResponse) => {
    await deleteAlert(alert.productId);
  };

  const handleReset = async (alert: AlertResponse) => {
    await updateAlert(alert.productId, { productId: alert.productId, resetStatus: true } as AlertUpdateRequest);
  };

  const handleSaveAlert = async (
    req: AlertCreateRequest | AlertUpdateRequest,
    productId: string,
  ) => {
    if (selectedAlert) await updateAlert(productId, req);
    else await createAlert(req);
  };

  const handleDeleteAlert = async (productId: string) => {
    await deleteAlert(productId);
  };

  const handleCloseAlertModal = () => {
    setAlertModalOpen(false);
    if (returnToList) {
      onOpen();
      setReturnToList(false);
    }
  };

  return (
    <>
      {open && (
        <AlertsModal
          open={open}
          onClose={handleClose}
          alerts={search.trim() ? view : baseAlerts}
          loading={viewLoading || alertsLoading}
          onRefresh={refreshAlerts}
          search={search}
          page={page}
          totalPages={totalPages}
          onSearchChange={(val) => runSearch(val, 1)}
          onPageChange={(p) => runSearch(search, p)}
          onReset={handleReset}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {alertModalOpen && (
        <AlertsDetailWidget
          widgetId="alerts-detail"
          open={alertModalOpen}
          onClose={handleCloseAlertModal}
          product={selectedProduct}
          existingAlert={selectedAlert}
          onSave={handleSaveAlert}
          onDelete={handleDeleteAlert}
        />
      )}
    </>
  );
};

export default Widget;

function buildAlertTarget(alert: AlertResponse): AlertTarget {
  return {
    id: alert.productId,
    title: alert.productName,
    priceSale: alert.productCurrentPrice ?? 0,
    priceOriginal: alert.productOriginalPrice ?? alert.productCurrentPrice ?? 0,
    brand: alert.productBrand,
    image: alert.productImage ?? alert.productImageUrl,
    productImageUrl: alert.productImageUrl ?? alert.productImage,
    url: alert.productUrl,
  };
}
