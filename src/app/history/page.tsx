import Link from "next/link";
import getDb from "@/lib/db";
import { ACCOUNT_CATEGORIES } from "@/types";
import DeleteButton from "@/components/DeleteButton";

interface EntryWithTotals {
  id: number;
  date: string;
  service_type: string;
  total_church: number;
  total_project: number;
  grand_total: number;
  [key: string]: unknown;
}

export default async function HistoryPage() {
  const db = await getDb();
  const result = await db.execute(
    `SELECT *,
      (offering_church + tithe_church + sunday_school_church + covenant_offering_church +
       thanksgiving_church + holy_communion_church + special_thanksgiving_church +
       fellowship_church + dedication_church + sow_a_seed_church + pastors_appreciation_church +
       harvest_church + project_support_church + lcc_church) AS total_church,
      (offering_project + tithe_project + sunday_school_project + covenant_offering_project +
       thanksgiving_project + holy_communion_project + special_thanksgiving_project +
       fellowship_project + dedication_project + sow_a_seed_project + pastors_appreciation_project +
       harvest_project + project_support_project + lcc_project) AS total_project,
      (offering_church + tithe_church + sunday_school_church + covenant_offering_church +
       thanksgiving_church + holy_communion_church + special_thanksgiving_church +
       fellowship_church + dedication_church + sow_a_seed_church + pastors_appreciation_church +
       harvest_church + project_support_church + lcc_church +
       offering_project + tithe_project + sunday_school_project + covenant_offering_project +
       thanksgiving_project + holy_communion_project + special_thanksgiving_project +
       fellowship_project + dedication_project + sow_a_seed_project + pastors_appreciation_project +
       harvest_project + project_support_project + lcc_project) AS grand_total
     FROM account_entries ORDER BY date DESC, id DESC`
  );
  const entries = result.rows as unknown as EntryWithTotals[];

  const overallTotal = entries.reduce((sum, e) => sum + e.grand_total, 0);

  function formatCurrency(n: number) {
    if (!n) return "-";
    return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Records</h1>
          <p className="text-lg text-gray-600 mt-1">
            {entries.length === 0
              ? "No entries yet. Add your first entry!"
              : `${entries.length} record${entries.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/entry" className="btn-primary">
            + New Entry
          </Link>
          {entries.length > 0 && (
            <a href="/api/export" className="btn-success">
              Export to Excel
            </a>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
            Overall Grand Total
          </div>
          <div className="text-3xl font-bold text-blue-800">
            {formatCurrency(overallTotal)}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-xl text-gray-500 mb-6">No records yet.</p>
          <Link href="/entry" className="btn-primary inline-block">
            Add First Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      {formatDate(entry.date)}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-base font-semibold px-3 py-1 rounded-full">
                      {entry.service_type}
                    </span>
                  </div>

                  {/* Summary of non-zero categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ACCOUNT_CATEGORIES.map((cat) => {
                      const church = (entry[`${cat.key}_church`] as number) || 0;
                      const project = (entry[`${cat.key}_project`] as number) || 0;
                      if (church === 0 && project === 0) return null;
                      return (
                        <span
                          key={cat.key}
                          className="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded-lg"
                        >
                          {cat.label}: {formatCurrency(church + project)}
                        </span>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-500 font-semibold">Church</div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(entry.total_church)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-500 font-semibold">Project</div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(entry.total_project)}
                      </div>
                    </div>
                    <div className="bg-blue-600 rounded-lg p-3 text-center">
                      <div className="text-sm text-blue-200 font-semibold">Total</div>
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(entry.grand_total)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 sm:min-w-[120px]">
                  <Link
                    href={`/entry/${entry.id}/edit`}
                    className="btn-secondary text-base py-2 px-4 text-center"
                  >
                    Edit
                  </Link>
                  <DeleteButton entryId={entry.id} entryDate={entry.date} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
