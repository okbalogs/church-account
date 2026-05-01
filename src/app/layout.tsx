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
        <header className="bg-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <span className="text-3xl">&#9997;</span>
              <span className="text-2xl font-bold tracking-tight">Church Account Manager</span>
            </Link>
            <nav className="flex gap-2">
              <Link
                href="/"
                className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg text-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/entry"
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2 rounded-lg text-lg transition-colors"
              >
                + New Entry
              </Link>
              <Link
                href="/history"
                className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg text-lg transition-colors"
              >
                Records
              </Link>
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
