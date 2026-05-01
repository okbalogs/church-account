import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Church Account Manager",
  description: "Sunday service account records",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 z-20">
          <div className="px-4 py-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm">
                ✝
              </div>
              <div className="leading-tight">
                <div className="font-bold text-slate-900 text-[15px]">Church Account</div>
                <div className="text-xs text-slate-400 font-medium">Manager</div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
            <div>
              <Link href="/" className="nav-link">
                <span className="text-xl">🏠</span> Dashboard
              </Link>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1.5">Income</p>
              <div className="space-y-0.5">
                <Link href="/entry" className="nav-link text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold">
                  <span className="text-xl">✏️</span> New Income
                </Link>
                <Link href="/history" className="nav-link">
                  <span className="text-xl">📋</span> Records
                </Link>
                <a href="/api/export" className="nav-link">
                  <span className="text-xl">📥</span> Export Excel
                </a>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-1.5">Expenditure</p>
              <div className="space-y-0.5">
                <Link href="/expenditure" className="nav-link text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-semibold">
                  <span className="text-xl">🧾</span> New Expenditure
                </Link>
                <Link href="/expenditure/history" className="nav-link">
                  <span className="text-xl">📊</span> Records
                </Link>
                <a href="/api/export/expenditure" className="nav-link">
                  <span className="text-xl">📥</span> Export Excel
                </a>
              </div>
            </div>
          </nav>

          <div className="px-4 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">Records stored securely</p>
          </div>
        </aside>

        {/* ── Mobile top header ── */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              ✝
            </div>
            <span className="font-bold text-slate-900">Church Account Manager</span>
          </div>
          <nav className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <Link href="/" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">Home</Link>
            <span className="flex-shrink-0 text-slate-300 self-center">|</span>
            <Link href="/entry" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg">+ Income</Link>
            <Link href="/history" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">Income Records</Link>
            <a href="/api/export" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">Export Income</a>
            <span className="flex-shrink-0 text-slate-300 self-center">|</span>
            <Link href="/expenditure" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg">+ Expenditure</Link>
            <Link href="/expenditure/history" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">Exp. Records</Link>
            <a href="/api/export/expenditure" className="flex-shrink-0 text-sm font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">Export Exp.</a>
          </nav>
        </header>

        {/* ── Page content ── */}
        <main className="lg:ml-56 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}
