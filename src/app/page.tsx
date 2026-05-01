import Link from "next/link";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

const INCOME_SUM = `
  offering_church + tithe_church + sunday_school_church + covenant_offering_church +
  thanksgiving_church + holy_communion_church + special_thanksgiving_church +
  fellowship_church + dedication_church + sow_a_seed_church + pastors_appreciation_church +
  harvest_church + project_support_church + lcc_church +
  offering_project + tithe_project + sunday_school_project + covenant_offering_project +
  thanksgiving_project + holy_communion_project + special_thanksgiving_project +
  fellowship_project + dedication_project + sow_a_seed_project + pastors_appreciation_project +
  harvest_project + project_support_project + lcc_project
`;

const EXP_SUM = `
  transportation_church + premise_church + percent25_church + gift_church +
  battery_church + fuel_church + electricity_church + lcc_dcc_church +
  entertainment_church + pastors_appreciation_church + stationeries_church +
  accessories_church + phcn_church + assessment_church +
  transportation_project + premise_project + percent25_project + gift_project +
  battery_project + fuel_project + electricity_project + lcc_dcc_project +
  entertainment_project + pastors_appreciation_project + stationeries_project +
  accessories_project + phcn_project + assessment_project
`;

export default async function HomePage() {
  const db = await getDb();

  const [recentIncomeRes, recentExpRes, incomeStatsRes, expStatsRes, incomeMonthRes, expMonthRes] =
    await Promise.all([
      db.execute(`SELECT id, date, service_type, (${INCOME_SUM}) AS grand_total FROM account_entries ORDER BY date DESC, id DESC LIMIT 5`),
      db.execute(`SELECT id, date, service_type, (${EXP_SUM}) AS grand_total FROM expenditure_entries ORDER BY date DESC, id DESC LIMIT 5`),
      db.execute(`SELECT COUNT(*) as count, COALESCE(SUM(${INCOME_SUM}), 0) as total FROM account_entries`),
      db.execute(`SELECT COUNT(*) as count, COALESCE(SUM(${EXP_SUM}), 0) as total FROM expenditure_entries`),
      db.execute(`SELECT COALESCE(SUM(${INCOME_SUM}), 0) as total FROM account_entries WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')`),
      db.execute(`SELECT COALESCE(SUM(${EXP_SUM}), 0) as total FROM expenditure_entries WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now')`),
    ]);

  const recentIncome = recentIncomeRes.rows as unknown as { id: number; date: string; service_type: string; grand_total: number }[];
  const recentExp = recentExpRes.rows as unknown as { id: number; date: string; service_type: string; grand_total: number }[];
  const incomeStats = incomeStatsRes.rows[0] as unknown as { count: number; total: number };
  const expStats = expStatsRes.rows[0] as unknown as { count: number; total: number };
  const incomeMonth = incomeMonthRes.rows[0] as unknown as { total: number };
  const expMonth = expMonthRes.rows[0] as unknown as { total: number };

  const netBalance = Number(incomeStats.total) - Number(expStats.total);
  const netMonth = Number(incomeMonth.total) - Number(expMonth.total);

  function fc(n: number) {
    const abs = Math.abs(n);
    return (n < 0 ? "-₦" : "₦") + abs.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  const now = new Date();
  const monthName = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-0.5">Overview for {monthName}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/entry" className="group bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors">✏️</div>
          <span className="font-semibold text-slate-800 group-hover:text-emerald-800 text-[15px]">New Income</span>
          <span className="text-xs text-slate-400 mt-0.5">Record collection</span>
        </Link>
        <Link href="/history" className="group bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors">📋</div>
          <span className="font-semibold text-slate-800 group-hover:text-blue-800 text-[15px]">Income Records</span>
          <span className="text-xs text-slate-400 mt-0.5">View all income</span>
        </Link>
        <Link href="/expenditure" className="group bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 bg-rose-100 group-hover:bg-rose-200 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors">🧾</div>
          <span className="font-semibold text-slate-800 group-hover:text-rose-800 text-[15px]">New Expenditure</span>
          <span className="text-xs text-slate-400 mt-0.5">Record spending</span>
        </Link>
        <Link href="/expenditure/history" className="group bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center text-2xl mb-3 transition-colors">📊</div>
          <span className="font-semibold text-slate-800 group-hover:text-orange-800 text-[15px]">Exp. Records</span>
          <span className="text-xs text-slate-400 mt-0.5">View all spending</span>
        </Link>
      </div>

      {/* Financial summary */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Financial Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">💰</div>
              <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wide">Total Income</span>
            </div>
            <div className="text-2xl font-bold mb-1">{fc(Number(incomeStats.total))}</div>
            <div className="text-sm text-emerald-100">{Number(incomeStats.count)} entries &nbsp;·&nbsp; This month: <span className="font-semibold text-white">{fc(Number(incomeMonth.total))}</span></div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">💸</div>
              <span className="text-sm font-semibold text-rose-100 uppercase tracking-wide">Total Expenditure</span>
            </div>
            <div className="text-2xl font-bold mb-1">{fc(Number(expStats.total))}</div>
            <div className="text-sm text-rose-100">{Number(expStats.count)} entries &nbsp;·&nbsp; This month: <span className="font-semibold text-white">{fc(Number(expMonth.total))}</span></div>
          </div>

          <div className={`bg-gradient-to-br ${netBalance >= 0 ? "from-indigo-500 to-violet-600" : "from-orange-500 to-orange-600"} rounded-2xl p-5 text-white shadow-sm`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">⚖️</div>
              <span className="text-sm font-semibold text-indigo-100 uppercase tracking-wide">Net Balance</span>
            </div>
            <div className="text-2xl font-bold mb-1">{fc(netBalance)}</div>
            <div className="text-sm text-indigo-100">Income − Expenditure &nbsp;·&nbsp; This month: <span className={`font-semibold text-white`}>{fc(netMonth)}</span></div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">Recent Income</h2>
            <Link href="/history" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View all →</Link>
          </div>
          {recentIncome.length === 0 ? (
            <div className="card text-center py-10 text-slate-400">No income entries yet</div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              {recentIncome.map((e, i) => (
                <div key={e.id} className={`flex items-center justify-between px-5 py-3.5 ${i < recentIncome.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div>
                    <div className="font-semibold text-slate-900 text-[15px]">{formatDate(e.date)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{e.service_type}</div>
                  </div>
                  <div className="text-base font-bold text-emerald-600">{fc(Number(e.grand_total))}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">Recent Expenditure</h2>
            <Link href="/expenditure/history" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View all →</Link>
          </div>
          {recentExp.length === 0 ? (
            <div className="card text-center py-10 text-slate-400">No expenditure entries yet</div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              {recentExp.map((e, i) => (
                <div key={e.id} className={`flex items-center justify-between px-5 py-3.5 ${i < recentExp.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div>
                    <div className="font-semibold text-slate-900 text-[15px]">{formatDate(e.date)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{e.service_type}</div>
                  </div>
                  <div className="text-base font-bold text-rose-600">{fc(Number(e.grand_total))}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Export to Excel</h2>
        <p className="text-sm text-slate-500 mb-4">Each export is a separate file matching the original spreadsheet format.</p>
        <div className="flex flex-wrap gap-3">
          <a href="/api/export" className="btn-success">📥 Download Income Excel</a>
          <a href="/api/export/expenditure" className="btn-expenditure btn">📥 Download Expenditure Excel</a>
        </div>
      </div>

    </div>
  );
}
