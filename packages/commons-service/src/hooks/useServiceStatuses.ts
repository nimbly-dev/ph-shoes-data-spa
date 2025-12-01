import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SERVICE_STATUS_TARGETS } from '@commons/config/serviceStatusTargets';
import { fetchServiceStatus } from '@commons/services/statusService';
import { ServiceStatusEntry, ServiceStatusTarget } from '@commons/types/ServiceStatus';

const POLL_INTERVAL_MS = 60_000;
const MANUAL_REFRESH_COOLDOWN_MS = 15_000;

export function useServiceStatuses(targets: ServiceStatusTarget[] = SERVICE_STATUS_TARGETS) {
  const [entries, setEntries] = useState<ServiceStatusEntry[]>(
    targets.map((target) => ({
      target,
      state: 'idle',
    }))
  );
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const [isAutoPolling, setAutoPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownUntilRef = useRef<number>(0);
  const [cooldownMsLeft, setCooldownMsLeft] = useState(0);

  const updateEntry = useCallback((targetId: string, partial: Partial<ServiceStatusEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
            entry.target.id === targetId ? { ...entry, ...partial } : entry
      )
    );
  }, []);

  const fetchStatuses = useCallback(async (): Promise<boolean> => {
    if (fetchingRef.current) return entriesRef.current.every((entry) => entry.serviceState === 'UP');
    fetchingRef.current = true;
    setAutoPolling(true);
    let allUp = true;
    try {
      for (const target of targets) {
        updateEntry(target.id, { state: 'loading' });
        try {
          const response = await fetchServiceStatus(target);
          const checkedAt = new Date();
          updateEntry(target.id, {
            state: 'success',
            serviceState: response.state,
            response,
            lastChecked: checkedAt,
            error: undefined,
          });
          if (response.state !== 'UP') {
            allUp = false;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch status';
          updateEntry(target.id, {
            state: 'error',
            serviceState: 'DOWN',
            response: undefined,
            error: msg,
            lastChecked: new Date(),
          });
          allUp = false;
        }
      }
    } finally {
      fetchingRef.current = false;
      setAutoPolling(false);
    }
    return allUp;
  }, [targets, updateEntry]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const allGreen = await fetchStatuses();
      if (cancelled) return;

      if (!allGreen) {
        timerRef.current = setTimeout(start, POLL_INTERVAL_MS);
      }
    };

    start();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [fetchStatuses]);

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return;
    const now = Date.now();
    if (cooldownUntilRef.current && now < cooldownUntilRef.current) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    cooldownUntilRef.current = Date.now() + MANUAL_REFRESH_COOLDOWN_MS;
    setCooldownMsLeft(MANUAL_REFRESH_COOLDOWN_MS);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    const tick = () => {
      const remaining = cooldownUntilRef.current - Date.now();
      if (remaining <= 0) {
        setCooldownMsLeft(0);
        cooldownTimerRef.current = null;
        cooldownUntilRef.current = 0;
      } else {
        setCooldownMsLeft(remaining);
        cooldownTimerRef.current = setTimeout(tick, 250);
      }
    };
    cooldownTimerRef.current = setTimeout(tick, 250);
    await fetchStatuses();
  }, [fetchStatuses]);

  const stats = useMemo(() => {
    const up = entries.filter((e) => e.serviceState === 'UP').length;
    return { up, total: entries.length };
  }, [entries]);

  return {
    entries,
    refresh,
    stats,
    isRefreshing: fetchingRef.current || isAutoPolling,
    cooldownMsLeft,
  };
}
