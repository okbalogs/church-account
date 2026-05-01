import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Church Account Manager",
  description: "Sunday service account records",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-blue-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 sm:mb-0">
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <span className="text-3xl">&#9997;</span>
                <span className="text-2xl font-bold tracking-tight">Church Account Manager</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-2 mt-3 sm:mt-2">
              <Link href="/" className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                Home
              </Link>

              {/* Income section */}
              <span className="flex items-center text-blue-300 text-base font-semibold px-2">|</span>
              <span className="flex items-center text-blue-200 text-sm font-bold uppercase tracking-wide px-1">Income:</span>
              <Link href="/entry" className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                + New Income
              </Link>
              <Link href="/history" className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                Income Records
              </Link>
              <a href="/api/export" className="bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                Export Income
              </a>

              {/* Expenditure section */}
              <span className="flex items-center text-blue-300 text-base font-semibold px-2">|</span>
              <span className="flex items-center text-blue-200 text-sm font-bold uppercase tracking-wide px-1">Expenditure:</span>
              <Link href="/expenditure" className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                + New Expenditure
              </Link>
              <Link href="/expenditure/history" className="bg-red-800 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                Expenditure Records
              </Link>
              <a href="/api/export/expenditure" className="bg-orange-700 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-base transition-colors">
                Export Expenditure
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-gray-200 text-gray-600 text-center py-4 text-base">
          Church Account Manager &mdash; All records stored securely on this device.
        </footer>
      </body>
    </html>
  );
}
