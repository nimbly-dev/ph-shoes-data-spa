import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertsService } from '@commons/services/alertsService';
import { AlertResponse } from '@commons/types/alerts';
import { WidgetRuntimeProps } from '@widget-runtime';
import { AlertsModal } from './AlertsModal';

type AlertsCenterWidgetProps = WidgetRuntimeProps & {
  open: boolean;
  onClose: () => void;
  alerts: AlertResponse[];
  loading: boolean;
  onRefresh: () => void;
  onResetAlert: (alert: AlertResponse) => Promise<void> | void;
  onDeleteAlert: (alert: AlertResponse) => Promise<void> | void;
  onEditAlert: (alert: AlertResponse) => void;
};

const ALERTS_PAGE_SIZE = 8;

function normalizeAlertsList(alerts: AlertResponse[] | undefined | null): AlertResponse[] {
  if (!Array.isArray(alerts)) return [];
  return alerts;
}

const Widget: React.FC<AlertsCenterWidgetProps> = ({
  open,
  onClose,
  alerts,
  loading,
  onRefresh,
  onResetAlert,
  onDeleteAlert,
  onEditAlert,
}) => {
  const baseAlerts = useMemo(() => normalizeAlertsList(alerts), [alerts]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<AlertResponse[]>(baseAlerts);
  const [viewLoading, setViewLoading] = useState(false);

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

  const handleClose = () => {
    onClose();
  };

  const handleEdit = (alert: AlertResponse) => {
    onEditAlert(alert);
  };

  const handleDelete = async (alert: AlertResponse) => {
    await onDeleteAlert(alert);
  };

  const handleReset = async (alert: AlertResponse) => {
    await onResetAlert(alert);
  };

  return (
    <AlertsModal
      open={open}
      onClose={handleClose}
      alerts={search.trim() ? view : baseAlerts}
      loading={viewLoading || loading}
      onRefresh={onRefresh}
      search={search}
      page={page}
      totalPages={totalPages}
      onSearchChange={(val) => runSearch(val, 1)}
      onPageChange={(p) => runSearch(search, p)}
      onReset={handleReset}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default Widget;
