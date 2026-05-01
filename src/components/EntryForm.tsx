"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNT_CATEGORIES, AccountEntry, SERVICE_TYPES } from "@/types";

type FormData = Omit<AccountEntry, "id" | "created_at">;

const emptyForm = (): FormData => ({
  date: new Date().toISOString().slice(0, 10),
  service_type: "SUNDAY SERVICE",
  offering_church: 0, offering_project: 0,
  tithe_church: 0, tithe_project: 0,
  sunday_school_church: 0, sunday_school_project: 0,
  covenant_offering_church: 0, covenant_offering_project: 0,
  thanksgiving_church: 0, thanksgiving_project: 0,
  holy_communion_church: 0, holy_communion_project: 0,
  special_thanksgiving_church: 0, special_thanksgiving_project: 0,
  fellowship_church: 0, fellowship_project: 0,
  dedication_church: 0, dedication_project: 0,
  sow_a_seed_church: 0, sow_a_seed_project: 0,
  pastors_appreciation_church: 0, pastors_appreciation_project: 0,
  harvest_church: 0, harvest_project: 0,
  project_support_church: 0, project_support_project: 0,
  lcc_church: 0, lcc_project: 0,
});

interface Props {
  initialData?: AccountEntry;
  mode: "create" | "edit";
}

export default function EntryForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialData ? { ...initialData } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function n(key: string): number {
    return ((form as Record<string, unknown>)[key] as number) || 0;
  }

  const totalChurch = ACCOUNT_CATEGORIES.reduce((s, c) => s + n(`${c.key}_church`), 0);
  const totalProject = ACCOUNT_CATEGORIES.reduce((s, c) => s + n(`${c.key}_project`), 0);
  const grandTotal = totalChurch + totalProject;

  function fc(v: number) {
    return v === 0 ? "₦0" : "₦" + v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = mode === "edit" && initialData?.id ? `/api/entries/${initialData.id}` : "/api/entries";
      const res = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      router.push("/history");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 rounded-xl px-4 py-3 text-base font-medium">
          {error}
        </div>
      )}

      {/* Service details */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-700 uppercase tracking-wide mb-4">Service Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="date">Date of Service</label>
            <input id="date" type="date" required className="field-input" value={form.date}
              onChange={(e) => setField("date", e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="service_type">Service Type</label>
            <select id="service_type" className="field-input" value={form.service_type}
              onChange={(e) => setField("service_type", e.target.value)}>
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Collection amounts */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-700 uppercase tracking-wide mb-4">Collection Amounts</h2>

        {/* Column headers — desktop */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-2 px-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Church (₦)</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Project (₦)</div>
        </div>

        <div className="space-y-1">
          {ACCOUNT_CATEGORIES.map((cat, idx) => (
            <div key={cat.key}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-3 items-center px-3 py-3 rounded-xl ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
              <div className="font-semibold text-slate-800">{cat.label}</div>
              <div>
                <label className="sm:hidden field-label">Church</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">₦</span>
                  <input type="number" min="0" step="0.01" className="field-input pl-7" placeholder="0.00"
                    value={n(`${cat.key}_church`) || ""}
                    onChange={(e) => setField(`${cat.key}_church` as keyof FormData, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    onFocus={(e) => e.target.select()} />
                </div>
              </div>
              <div>
                <label className="sm:hidden field-label">Project</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">₦</span>
                  <input type="number" min="0" step="0.01" className="field-input pl-7" placeholder="0.00"
                    value={n(`${cat.key}_project`) || ""}
                    onChange={(e) => setField(`${cat.key}_project` as keyof FormData, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    onFocus={(e) => e.target.select()} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky totals */}
      <div className="sticky bottom-4 z-10">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-5 py-4">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Church</div>
              <div className="text-lg font-bold text-slate-800">{fc(totalChurch)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Project</div>
              <div className="text-lg font-bold text-slate-800">{fc(totalProject)}</div>
            </div>
            <div className="bg-emerald-600 rounded-xl py-1 px-2">
              <div className="text-xs text-emerald-200 font-semibold uppercase tracking-widest mb-1">Grand Total</div>
              <div className="text-lg font-bold text-white">{fc(grandTotal)}</div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.back()} className="btn-secondary btn">Cancel</button>
            <button type="submit" disabled={saving} className="btn-income btn px-8">
              {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
