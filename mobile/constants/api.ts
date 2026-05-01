const BASE = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  if (!BASE) {
    throw new Error(
      "API URL not configured.\nCreate a .env file with:\nEXPO_PUBLIC_API_URL=https://your-app.vercel.app"
    );
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fc(n: number): string {
  if (!n) return "₦0";
  return "₦" + Math.abs(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}
