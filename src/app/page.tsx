import Link from "next/link";
import getDb from "@/lib/db";

interface EntryRow {
  id: number;
  date: string;
  service_type: string;
  grand_total: number;
  total_church: number;
  total_project: number;
}

export default function HomePage() {
  const db = getDb();

  const recentEntries = db
    .prepare(
      `SELECT id, date, service_type,
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
       FROM account_entries ORDER BY date DESC, id DESC LIMIT 5`
    )
    .all() as EntryRow[];

  const stats = db
    .prepare(
      `SELECT COUNT(*) as count,
        COALESCE(SUM(
          offering_church + tithe_church + sunday_school_church + covenant_offering_church +
          thanksgiving_church + holy_communion_church + special_thanksgiving_church +
          fellowship_church + dedication_church + sow_a_seed_church + pastors_appreciation_church +
          harvest_church + project_support_church + lcc_church +
          offering_project + tithe_project + sunday_school_project + covenant_offering_project +
          thanksgiving_project + holy_communion_project + special_thanksgiving_project +
          fellowship_project + dedication_project + sow_a_seed_project + pastors_appreciation_project +
          harvest_project + project_support_project + lcc_project
        ), 0) as total
       FROM account_entries`
    )
    .get() as { count: number; total: number };

  const thisMonthStats = db
    .prepare(
      `SELECT COUNT(*) as count,
        COALESCE(SUM(
          offering_church + tithe_church + sunday_school_church + covenant_offering_church +
          thanksgiving_church + holy_communion_church + special_thanksgiving_church +
          fellowship_church + dedication_church + sow_a_seed_church + pastors_appreciation_church +
          harvest_church + project_support_church + lcc_church +
          offering_project + tithe_project + sunday_school_project + covenant_offering_project +
          thanksgiving_project + holy_communion_project + special_thanksgiving_project +
          fellowship_project + dedication_project + sow_a_seed_project + pastors_appreciation_project +
          harvest_project + project_support_project + lcc_project
        ), 0) as total
       FROM account_entries
       WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')`
    )
    .get() as { count: number; total: number };

  function formatCurrency(n: number) {
    if (!n) return "₦0.00";
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
    <div className="space-y-8">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome</h1>
        <p className="text-xl text-blue-100">
          Record and manage your church collection accounts easily.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/entry"
          className="card flex flex-col items-center justify-center text-center py-10 hover:shadow-xl transition-shadow border-2 border-blue-200 hover:border-blue-400 group cursor-pointer"
        >
          <span className="text-5xl mb-3">✏️</span>
          <span className="text-2xl font-bold text-blue-800 group-hover:text-blue-600">
            New Entry
          </span>
          <span className="text-base text-gray-500 mt-1">
            Record today&apos;s collection
          </span>
        </Link>

        <Link
          href="/history"
          className="card flex flex-col items-center justify-center text-center py-10 hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-blue-300 group cursor-pointer"
        >
          <span className="text-5xl mb-3">📋</span>
          <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-700">
            View Records
          </span>
          <span className="text-base text-gray-500 mt-1">
            Browse all past entries
          </span>
        </Link>

        <a
          href="/api/export"
          className="card flex flex-col items-center justify-center text-center py-10 hover:shadow-xl transition-shadow border-2 border-green-200 hover:border-green-400 group cursor-pointer"
        >
          <span className="text-5xl mb-3">📥</span>
          <span className="text-2xl font-bold text-green-800 group-hover:text-green-600">
            Export to Excel
          </span>
          <span className="text-base text-gray-500 mt-1">
            Download all records
          </span>
        </a>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Total Entries
            </div>
            <div className="text-3xl font-bold text-blue-700">{stats.count}</div>
          </div>
          <div className="card text-center">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              All-Time Total
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(stats.total)}
            </div>
          </div>
          <div className="card text-center">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              This Month
            </div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(thisMonthStats.total)}
            </div>
          </div>
          <div className="card text-center">
            <div className="text-base text-gray-500 font-semibold uppercase tracking-wide mb-1">
              This Month (count)
            </div>
            <div className="text-3xl font-bold text-green-700">
              {thisMonthStats.count}
            </div>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Entries</h2>
            <Link href="/history" className="text-blue-700 hover:underline text-lg font-semibold">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-lg text-gray-900">
                    {formatDate(entry.date)}
                  </span>
                  <span className="ml-3 bg-blue-100 text-blue-700 text-base font-semibold px-2 py-0.5 rounded-full">
                    {entry.service_type}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-xl font-bold text-blue-700">
                      {formatCurrency(entry.grand_total)}
                    </div>
                  </div>
                  <Link
                    href={`/entry/${entry.id}/edit`}
                    className="btn-secondary text-base py-2 px-4"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentEntries.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-xl text-gray-500 mb-5">No entries yet. Start by adding your first record.</p>
          <Link href="/entry" className="btn-primary inline-block">
            Add First Entry
          </Link>
        </div>
      )}
    </div>
  );
}
