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
      db.execute(`SELECT id, date, service_type, (${INCOME_SUM}) AS grand_total FROM account_entries ORDER BY date DESC, id DESC LIMIT 4`),
      db.execute(`SELECT id, date, service_type, (${EXP_SUM}) AS grand_total FROM expenditure_entries ORDER BY date DESC, id DESC LIMIT 4`),
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
    return (n < 0 ? "-" : "") + "₦" + abs.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-8">
      <div className="card bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <h1 className="text-3xl font-bold mb-1">Welcome</h1>
        <p className="text-xl text-blue-100">Record and manage your church income and expenditure accounts.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/entry" className="card flex flex-col items-center text-center py-8 hover:shadow-xl transition-shadow border-2 border-green-200 hover:border-green-400 group">
          <span className="text-4xl mb-2">✏️</span>
          <span className="text-xl font-bold text-green-800 group-hover:text-green-600">New Income</span>
          <span className="text-sm text-gray-500 mt-1">Record collection</span>
        </Link>
        <Link href="/history" className="card flex flex-col items-center text-center py-8 hover:shadow-xl transition-shadow border-2 border-blue-200 hover:border-blue-400 group">
          <span className="text-4xl mb-2">📋</span>
          <span className="text-xl font-bold text-blue-800 group-hover:text-blue-600">Income Records</span>
          <span className="text-sm text-gray-500 mt-1">View all income</span>
        </Link>
        <Link href="/expenditure" className="card flex flex-col items-center text-center py-8 hover:shadow-xl transition-shadow border-2 border-red-200 hover:border-red-400 group">
          <span className="text-4xl mb-2">🧾</span>
          <span className="text-xl font-bold text-red-800 group-hover:text-red-600">New Expenditure</span>
          <span className="text-sm text-gray-500 mt-1">Record spending</span>
        </Link>
        <Link href="/expenditure/history" className="card flex flex-col items-center text-center py-8 hover:shadow-xl transition-shadow border-2 border-orange-200 hover:border-orange-400 group">
          <span className="text-4xl mb-2">📊</span>
          <span className="text-xl font-bold text-orange-800 group-hover:text-orange-600">Expenditure Records</span>
          <span className="text-sm text-gray-500 mt-1">View all spending</span>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card border-l-4 border-l-green-500">
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Total Income ({Number(incomeStats.count)} entries)</div>
            <div className="text-2xl font-bold text-green-700">{fc(Number(incomeStats.total))}</div>
            <div className="text-base text-gray-500 mt-1">This month: <span className="font-semibold text-green-600">{fc(Number(incomeMonth.total))}</span></div>
          </div>
          <div className="card border-l-4 border-l-red-500">
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Total Expenditure ({Number(expStats.count)} entries)</div>
            <div className="text-2xl font-bold text-red-700">{fc(Number(expStats.total))}</div>
            <div className="text-base text-gray-500 mt-1">This month: <span className="font-semibold text-red-600">{fc(Number(expMonth.total))}</span></div>
          </div>
          <div className={`card border-l-4 ${netBalance >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Net Balance (Income − Expenditure)</div>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-blue-700" : "text-orange-700"}`}>{fc(netBalance)}</div>
            <div className="text-base text-gray-500 mt-1">This month: <span className={`font-semibold ${netMonth >= 0 ? "text-blue-600" : "text-orange-600"}`}>{fc(netMonth)}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Export to Excel</h2>
        <p className="text-base text-gray-500 mb-4">Each export is a separate file matching the original spreadsheet format.</p>
        <div className="flex flex-wrap gap-4">
          <a href="/api/export" className="btn-success flex items-center gap-2"><span>📥</span> Download Income Excel</a>
          <a href="/api/export/expenditure" className="bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors flex items-center gap-2"><span>📥</span> Download Expenditure Excel</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">Recent Income</h2>
            <Link href="/history" className="text-blue-700 hover:underline text-base font-semibold">View all &rarr;</Link>
          </div>
          {recentIncome.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-lg">No income entries yet</div>
          ) : (
            <div className="space-y-2">
              {recentIncome.map((e) => (
                <div key={e.id} className="card flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-base text-gray-900">{formatDate(e.date)}</div>
                    <div className="text-sm text-gray-500">{e.service_type}</div>
                  </div>
                  <div className="text-lg font-bold text-green-700">{fc(Number(e.grand_total))}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">Recent Expenditure</h2>
            <Link href="/expenditure/history" className="text-red-700 hover:underline text-base font-semibold">View all &rarr;</Link>
          </div>
          {recentExp.length === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-lg">No expenditure entries yet</div>
          ) : (
            <div className="space-y-2">
              {recentExp.map((e) => (
                <div key={e.id} className="card flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-base text-gray-900">{formatDate(e.date)}</div>
                    <div className="text-sm text-gray-500">{e.service_type}</div>
                  </div>
                  <div className="text-lg font-bold text-red-700">{fc(Number(e.grand_total))}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
