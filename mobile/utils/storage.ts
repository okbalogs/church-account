import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  INCOME: "INCOME_CACHE",
  EXP: "EXP_CACHE",
  QUEUE: "WRITE_QUEUE",
} as const;

export interface CachedEntry {
  id: number;
  date: string;
  service_type: string;
  grand_total: number;
  total_church: number;
  total_project: number;
  pending?: boolean;
  [key: string]: unknown;
}

export interface QueuedOp {
  opId: string;
  type: "POST" | "PUT" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
  tempId?: number;
}

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const getIncomeCache = () => get<CachedEntry[]>(KEYS.INCOME, []);
export const setIncomeCache = (v: CachedEntry[]) => set(KEYS.INCOME, v);
export const getExpCache = () => get<CachedEntry[]>(KEYS.EXP, []);
export const setExpCache = (v: CachedEntry[]) => set(KEYS.EXP, v);

export const getQueue = () => get<QueuedOp[]>(KEYS.QUEUE, []);
export const setQueue = (q: QueuedOp[]) => set(KEYS.QUEUE, q);

export async function enqueue(op: QueuedOp): Promise<void> {
  const q = await getQueue();
  await setQueue([...q, op]);
}

export async function hasPendingForId(id: number): Promise<boolean> {
  const q = await getQueue();
  return q.some(op =>
    op.tempId === id ||
    op.path === `/api/entries/${id}` ||
    op.path === `/api/expenditure/${id}`
  );
}

export async function getPendingIds(): Promise<Set<number>> {
  const q = await getQueue();
  const ids = new Set<number>();
  for (const op of q) {
    if (op.tempId !== undefined) ids.add(op.tempId);
    const match = op.path.match(/\/(\d+)$/);
    if (match) ids.add(Number(match[1]));
  }
  return ids;
}
