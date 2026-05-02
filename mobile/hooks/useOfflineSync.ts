import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { apiFetch } from "../constants/api";
import {
  CachedEntry, QueuedOp,
  getIncomeCache, setIncomeCache,
  getExpCache, setExpCache,
  getQueue, setQueue,
} from "../utils/storage";

interface OnlineCtx {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
}

export const OnlineContext = createContext<OnlineCtx>({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  refreshPendingCount: async () => {},
});

export function useOnline() {
  return useContext(OnlineContext);
}

export function useOfflineSyncState(): OnlineCtx {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const wasPreviouslyOffline = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const q = await getQueue();
    setPendingCount(q.length);
  }, []);

  const flushQueue = useCallback(async () => {
    const queue = await getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let remaining = [...queue];

    for (let i = 0; i < remaining.length; i++) {
      const op = remaining[i];
      try {
        let result: CachedEntry | null = null;

        if (op.type === "DELETE") {
          await apiFetch(op.path, { method: "DELETE" });
        } else if (op.type === "POST") {
          result = await apiFetch<CachedEntry>(op.path, { method: "POST", body: JSON.stringify(op.body) });
          if (result && op.tempId !== undefined) {
            const realId = result.id;
            remaining = remaining.map(o =>
              o.path.includes(String(op.tempId))
                ? { ...o, path: o.path.replace(String(op.tempId), String(realId)), tempId: undefined }
                : o
            );
            const cache = await getIncomeCache();
            const updated = cache.map(e => e.id === op.tempId ? { ...result!, pending: false } : e);
            await setIncomeCache(updated);
            const expCache = await getExpCache();
            const updatedExp = expCache.map(e => e.id === op.tempId ? { ...result!, pending: false } : e);
            await setExpCache(updatedExp);
          }
        } else {
          result = await apiFetch<CachedEntry>(op.path, { method: "PUT", body: JSON.stringify(op.body) });
          if (result) {
            const isIncome = op.path.startsWith("/api/entries");
            if (isIncome) {
              const cache = await getIncomeCache();
              await setIncomeCache(cache.map(e => e.id === result!.id ? { ...result!, pending: false } : e));
            } else {
              const cache = await getExpCache();
              await setExpCache(cache.map(e => e.id === result!.id ? { ...result!, pending: false } : e));
            }
          }
        }

        remaining = remaining.filter(o => o.opId !== op.opId);
        await setQueue(remaining);
      } catch {
        break;
      }
    }

    if (remaining.length === 0) {
      try {
        const [inc, exp] = await Promise.all([
          apiFetch<CachedEntry[]>("/api/entries"),
          apiFetch<CachedEntry[]>("/api/expenditure"),
        ]);
        await setIncomeCache(inc);
        await setExpCache(exp);
      } catch {}
    }

    setPendingCount(remaining.length);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const unsub = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      if (online && wasPreviouslyOffline.current) {
        flushQueue();
      }
      wasPreviouslyOffline.current = !online;
    });

    return unsub;
  }, [flushQueue, refreshPendingCount]);

  return { isOnline, isSyncing, pendingCount, refreshPendingCount };
}
