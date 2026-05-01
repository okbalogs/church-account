"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNT_CATEGORIES, AccountEntry, SERVICE_TYPES } from "@/types";

type FormData = Omit<AccountEntry, "id" | "created_at">;

const emptyForm = (): FormData => ({
  date: new Date().toISOString().slice(0, 10),
  service_type: "SUNDAY SERVICE",
  offering_church: 0,
  offering_project: 0,
  tithe_church: 0,
  tithe_project: 0,
  sunday_school_church: 0,
  sunday_school_project: 0,
  covenant_offering_church: 0,
  covenant_offering_project: 0,
  thanksgiving_church: 0,
  thanksgiving_project: 0,
  holy_communion_church: 0,
  holy_communion_project: 0,
  special_thanksgiving_church: 0,
  special_thanksgiving_project: 0,
  fellowship_church: 0,
  fellowship_project: 0,
  dedication_church: 0,
  dedication_project: 0,
  sow_a_seed_church: 0,
  sow_a_seed_project: 0,
  pastors_appreciation_church: 0,
  pastors_appreciation_project: 0,
  harvest_church: 0,
  harvest_project: 0,
  project_support_church: 0,
  project_support_project: 0,
  lcc_church: 0,
  lcc_project: 0,
});

interface Props {
  initialData?: AccountEntry;
  mode: "create" | "edit";
}

export default function EntryForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    initialData
      ? {
          date: initialData.date,
          service_type: initialData.service_type,
          offering_church: initialData.offering_church,
          offering_project: initialData.offering_project,
          tithe_church: initialData.tithe_church,
          tithe_project: initialData.tithe_project,
          sunday_school_church: initialData.sunday_school_church,
          sunday_school_project: initialData.sunday_school_project,
          covenant_offering_church: initialData.covenant_offering_church,
          covenant_offering_project: initialData.covenant_offering_project,
          thanksgiving_church: initialData.thanksgiving_church,
          thanksgiving_project: initialData.thanksgiving_project,
          holy_communion_church: initialData.holy_communion_church,
          holy_communion_project: initialData.holy_communion_project,
          special_thanksgiving_church: initialData.special_thanksgiving_church,
          special_thanksgiving_project: initialData.special_thanksgiving_project,
          fellowship_church: initialData.fellowship_church,
          fellowship_project: initialData.fellowship_project,
          dedication_church: initialData.dedication_church,
          dedication_project: initialData.dedication_project,
          sow_a_seed_church: initialData.sow_a_seed_church,
          sow_a_seed_project: initialData.sow_a_seed_project,
          pastors_appreciation_church: initialData.pastors_appreciation_church,
          pastors_appreciation_project: initialData.pastors_appreciation_project,
          harvest_church: initialData.harvest_church,
          harvest_project: initialData.harvest_project,
          project_support_church: initialData.project_support_church,
          project_support_project: initialData.project_support_project,
          lcc_church: initialData.lcc_church,
          lcc_project: initialData.lcc_project,
        }
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
    return ACCOUNT_CATEGORIES.reduce(
      (sum, cat) => sum + (numVal(`${cat.key}_church`) || 0),
      0
    );
  }

  function totalProject(): number {
    return ACCOUNT_CATEGORIES.reduce(
      (sum, cat) => sum + (numVal(`${cat.key}_project`) || 0),
      0
    );
  }

  function grandTotal(): number {
    return totalChurch() + totalProject();
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
          ? `/api/entries/${initialData.id}`
          : "/api/entries";
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

      router.push("/history");
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
        <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-100">
          Service Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="field-label" htmlFor="date">
              Date of Service
            </label>
            <input
              id="date"
              type="date"
              required
              className="field-input"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="service_type">
              Service Type
            </label>
            <select
              id="service_type"
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
        <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-100">
          Collection Amounts
        </h2>

        {/* Column headers */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-3 px-1">
          <div className="text-base font-bold text-gray-500 uppercase tracking-wide">Category</div>
          <div className="text-base font-bold text-gray-500 uppercase tracking-wide text-center">Church</div>
          <div className="text-base font-bold text-gray-500 uppercase tracking-wide text-center">Project</div>
        </div>

        <div className="space-y-3">
          {ACCOUNT_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.key}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 rounded-xl ${
                idx % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="font-semibold text-lg text-gray-800">
                {cat.label}
              </div>
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
      <div className="card bg-blue-50 border-blue-200">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Running Total</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Church Total
            </div>
            <div className="text-2xl font-bold text-blue-700">
              ₦{formatCurrency(totalChurch())}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Project Total
            </div>
            <div className="text-2xl font-bold text-blue-700">
              ₦{formatCurrency(totalProject())}
            </div>
          </div>
          <div className="bg-blue-700 rounded-xl p-4 shadow-sm">
            <div className="text-base text-blue-200 font-semibold uppercase tracking-wide mb-1">
              Grand Total
            </div>
            <div className="text-2xl font-bold text-white">
              ₦{formatCurrency(grandTotal())}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving
            ? "Saving..."
            : mode === "edit"
            ? "Save Changes"
            : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
