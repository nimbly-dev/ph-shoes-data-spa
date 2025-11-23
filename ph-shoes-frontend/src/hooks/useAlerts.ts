import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertsService } from '../services/alertsService';
import { AlertCreateRequest, AlertResponse, AlertUpdateRequest } from '../types/alerts';

export function useAlerts(enabled: boolean) {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setAlerts([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await AlertsService.list();
      if (Array.isArray(res)) {
        setAlerts(res);
      } else if (res && Array.isArray((res as any).content)) {
        setAlerts((res as any).content);
      } else {
        setAlerts([]);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (req: AlertCreateRequest) => {
    const res = await AlertsService.create(req);
    setAlerts((prev) => {
      const idx = prev.findIndex((a) => a.productId === res.productId);
      if (idx >= 0) return prev.map((a, i) => (i === idx ? res : a));
      return [...prev, res];
    });
    return res;
  }, []);

  const update = useCallback(async (productId: string, req: AlertUpdateRequest) => {
    const res = await AlertsService.update(productId, req);
    setAlerts((prev) => prev.map((a) => (a.productId === productId ? res : a)));
    return res;
  }, []);

  const remove = useCallback(async (productId: string) => {
    await AlertsService.remove(productId);
    setAlerts((prev) => prev.filter((a) => a.productId !== productId));
  }, []);

  const triggeredCount = useMemo(() => {
    return Array.isArray(alerts)
      ? alerts.filter((a) => a.status === 'TRIGGERED').length
      : 0;
  }, [alerts]);

  return {
    alerts,
    loading,
    error,
    triggeredCount,
    refresh: load,
    create,
    update,
    remove,
    setAlerts,
  };
}
