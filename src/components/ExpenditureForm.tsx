"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXPENDITURE_CATEGORIES, ExpenditureEntry, SERVICE_TYPES } from "@/types";

type FormData = Omit<ExpenditureEntry, "id" | "created_at">;

const emptyForm = (): FormData => ({
  date: new Date().toISOString().slice(0, 10),
  service_type: "SUNDAY SERVICE",
  transportation_church: 0,
  transportation_project: 0,
  premise_church: 0,
  premise_project: 0,
  percent25_church: 0,
  percent25_project: 0,
  gift_church: 0,
  gift_project: 0,
  battery_church: 0,
  battery_project: 0,
  fuel_church: 0,
  fuel_project: 0,
  electricity_church: 0,
  electricity_project: 0,
  lcc_dcc_church: 0,
  lcc_dcc_project: 0,
  entertainment_church: 0,
  entertainment_project: 0,
  pastors_appreciation_church: 0,
  pastors_appreciation_project: 0,
  stationeries_church: 0,
  stationeries_project: 0,
  accessories_church: 0,
  accessories_project: 0,
  phcn_church: 0,
  phcn_project: 0,
  assessment_church: 0,
  assessment_project: 0,
});

interface Props {
  initialData?: ExpenditureEntry;
  mode: "create" | "edit";
}

export default function ExpenditureForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    initialData
      ? { ...initialData }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function numVal(key: string): number {
    return (form as Record<string, unknown>)[key] as number;
  }

  function totalChurch(): number {
    return EXPENDITURE_CATEGORIES.reduce(
      (sum, cat) => sum + (numVal(`${cat.key}_church`) || 0),
      0
    );
  }

  function totalProject(): number {
    return EXPENDITURE_CATEGORIES.reduce(
      (sum, cat) => sum + (numVal(`${cat.key}_project`) || 0),
      0
    );
  }

  function formatCurrency(n: number) {
    if (n === 0) return "-";
    return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url =
        mode === "edit" && initialData?.id
          ? `/api/expenditure/${initialData.id}`
          : "/api/expenditure";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/expenditure/history");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-2 border-red-400 text-red-800 rounded-xl p-4 text-lg font-semibold">
          Error: {error}
        </div>
      )}

      {/* Date & Service Type */}
      <div className="card">
        <h2 className="text-2xl font-bold text-red-800 mb-5 pb-3 border-b-2 border-red-100">
          Service Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="field-label" htmlFor="exp-date">
              Date of Service
            </label>
            <input
              id="exp-date"
              type="date"
              required
              className="field-input"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="exp-service-type">
              Service Type
            </label>
            <select
              id="exp-service-type"
              className="field-input"
              value={form.service_type}
              onChange={(e) => setField("service_type", e.target.value)}
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="card">
        <h2 className="text-2xl font-bold text-red-800 mb-5 pb-3 border-b-2 border-red-100">
          Expenditure Amounts
        </h2>

        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-3 px-1">
          <div className="text-base font-bold text-gray-500 uppercase tracking-wide">Category</div>
          <div className="text-base font-bold text-gray-500 uppercase tracking-wide text-center">Church</div>
          <div className="text-base font-bold text-gray-500 uppercase tracking-wide text-center">Project</div>
        </div>

        <div className="space-y-3">
          {EXPENDITURE_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.key}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 rounded-xl ${
                idx % 2 === 0 ? "bg-red-50" : "bg-white"
              }`}
            >
              <div className="font-semibold text-lg text-gray-800">{cat.label}</div>
              <div>
                <label className="sm:hidden field-label">Church</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg select-none">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input pl-8"
                    placeholder="0.00"
                    value={numVal(`${cat.key}_church`) || ""}
                    onChange={(e) =>
                      setField(
                        `${cat.key}_church` as keyof FormData,
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
              <div>
                <label className="sm:hidden field-label">Project</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg select-none">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="field-input pl-8"
                    placeholder="0.00"
                    value={numVal(`${cat.key}_project`) || ""}
                    onChange={(e) =>
                      setField(
                        `${cat.key}_project` as keyof FormData,
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Running Totals */}
      <div className="card bg-red-50 border-red-200">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Running Total</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Church Total
            </div>
            <div className="text-2xl font-bold text-red-700">
              ₦{formatCurrency(totalChurch())}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Project Total
            </div>
            <div className="text-2xl font-bold text-red-700">
              ₦{formatCurrency(totalProject())}
            </div>
          </div>
          <div className="bg-red-700 rounded-xl p-4 shadow-sm">
            <div className="text-base text-red-200 font-semibold uppercase tracking-wide mb-1">
              Grand Total
            </div>
            <div className="text-2xl font-bold text-white">
              ₦{formatCurrency(totalChurch() + totalProject())}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pb-8">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
