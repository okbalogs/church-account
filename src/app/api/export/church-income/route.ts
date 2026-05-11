import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.execute(`
      SELECT *,
        (offering_church + tithe_church + sunday_school_church + covenant_offering_church +
         thanksgiving_church + holy_communion_church + special_thanksgiving_church +
         fellowship_church + dedication_church + sow_a_seed_church + pastors_appreciation_church +
         harvest_church + project_support_church + lcc_church) AS total_church
      FROM account_entries ORDER BY date ASC, id ASC
    `);

    const entries = result.rows as Record<string, unknown>[];

    const headerRow1 = [
      "DATE", "SUNDAY SERVICE",
      "OFFERING", "TITHE", "SUNDAY SCHOOL", "COVENANT OFFERING",
      "THANKSGIVING", "HOLY COMMUNION", "SPECIAL THANKSGIVING/GIFT",
      "FELLOWSHIP", "DEDICATION", "SOW A SEED",
      "PASTOR'S APPRECIATION", "HARVEST", "PROJECT SUPPORT", "LCC",
      "TOTAL (CHURCH)",
    ];

    const dataRows = entries.map((e) => [
      e.date, e.service_type,
      z(e.offering_church),
      z(e.tithe_church),
      z(e.sunday_school_church),
      z(e.covenant_offering_church),
      z(e.thanksgiving_church),
      z(e.holy_communion_church),
      z(e.special_thanksgiving_church),
      z(e.fellowship_church),
      z(e.dedication_church),
      z(e.sow_a_seed_church),
      z(e.pastors_appreciation_church),
      z(e.harvest_church),
      z(e.project_support_church),
      z(e.lcc_church),
      z(e.total_church),
    ]);

    const totalsRow: (string | number)[] = ["TOTALS", ""];
    for (let col = 2; col < headerRow1.length; col++) {
      const sum = dataRows.reduce((a, r) => a + (typeof r[col] === "number" ? (r[col] as number) : 0), 0);
      totalsRow.push(sum === 0 ? "" : sum);
    }

    const ws = XLSX.utils.aoa_to_sheet([headerRow1, ...dataRows, totalsRow]);
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, ...Array(15).fill({ wch: 14 })];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Church Income");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="church-income-only-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export/church-income error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}

function z(val: unknown): number | string {
  const n = Number(val);
  return n === 0 ? "" : n;
}
