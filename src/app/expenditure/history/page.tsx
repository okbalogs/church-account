import Link from "next/link";
import getDb from "@/lib/db";
import { EXPENDITURE_CATEGORIES } from "@/types";
import DeleteExpenditureButton from "@/components/DeleteExpenditureButton";

export const dynamic = "force-dynamic";

interface EntryWithTotals {
  id: number;
  date: string;
  service_type: string;
  total_church: number;
  total_project: number;
  grand_total: number;
  [key: string]: unknown;
}

export default async function ExpenditureHistoryPage() {
  const db = await getDb();
  const result = await db.execute(
    `SELECT *,
      (transportation_church + premise_church + percent25_church + gift_church +
       battery_church + fuel_church + electricity_church + lcc_dcc_church +
       entertainment_church + pastors_appreciation_church + stationeries_church +
       accessories_church + phcn_church + assessment_church) AS total_church,
      (transportation_project + premise_project + percent25_project + gift_project +
       battery_project + fuel_project + electricity_project + lcc_dcc_project +
       entertainment_project + pastors_appreciation_project + stationeries_project +
       accessories_project + phcn_project + assessment_project) AS total_project,
      (transportation_church + premise_church + percent25_church + gift_church +
       battery_church + fuel_church + electricity_church + lcc_dcc_church +
       entertainment_church + pastors_appreciation_church + stationeries_church +
       accessories_church + phcn_church + assessment_church +
       transportation_project + premise_project + percent25_project + gift_project +
       battery_project + fuel_project + electricity_project + lcc_dcc_project +
       entertainment_project + pastors_appreciation_project + stationeries_project +
       accessories_project + phcn_project + assessment_project) AS grand_total
     FROM expenditure_entries ORDER BY date DESC, id DESC`
  );
  const entries = result.rows as unknown as EntryWithTotals[];

  const overallTotal = entries.reduce((sum, e) => sum + Number(e.grand_total), 0);

  function fc(n: number) {
    if (!n) return "—";
    return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenditure Records</h1>
          <p className="text-slate-500 mt-0.5">
            {entries.length === 0 ? "No entries yet" : `${entries.length} record${entries.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/expenditure" className="btn-expenditure btn">+ New Expenditure</Link>
          {entries.length > 0 && (
            <a href="/api/export/expenditure" className="btn-success btn">📥 Export Excel</a>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-rose-100 mb-1">Overall Total Expenditure</div>
          <div className="text-3xl font-bold">{"₦" + overallTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-xl text-slate-400 mb-6">No records yet.</p>
          <Link href="/expenditure" className="btn-expenditure btn">Add First Entry</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-slate-900">{formatDate(entry.date)}</span>
                    <span className="bg-rose-50 text-rose-700 text-sm font-semibold px-3 py-0.5 rounded-full border border-rose-200">
                      {entry.service_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {EXPENDITURE_CATEGORIES.map((cat) => {
                      const church = (entry[`${cat.key}_church`] as number) || 0;
                      const project = (entry[`${cat.key}_project`] as number) || 0;
                      if (church === 0 && project === 0) return null;
                      return (
                        <span key={cat.key} className="bg-rose-50 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-rose-100">
                          {cat.label}: {fc(church + project)}
                        </span>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Church</div>
                      <div className="font-bold text-slate-800">{fc(Number(entry.total_church))}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Project</div>
                      <div className="font-bold text-slate-800">{fc(Number(entry.total_project))}</div>
                    </div>
                    <div className="bg-rose-600 rounded-xl p-3 text-center">
                      <div className="text-xs text-rose-200 font-semibold uppercase tracking-wide mb-0.5">Total</div>
                      <div className="font-bold text-white">{fc(Number(entry.grand_total))}</div>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 sm:min-w-[100px]">
                  <Link href={`/expenditure/${entry.id}/edit`} className="btn-secondary btn btn-sm text-center flex-1 sm:flex-none">
                    Edit
                  </Link>
                  <DeleteExpenditureButton entryId={entry.id} entryDate={entry.date} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
