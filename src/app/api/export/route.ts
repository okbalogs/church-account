import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const db = getDb();
    const entries = db
      .prepare(
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
         FROM account_entries ORDER BY date ASC, id ASC`
      )
      .all() as Record<string, unknown>[];

    const wb = XLSX.utils.book_new();

    const headerRow1 = [
      "DATE", "SUNDAY SERVICE",
      "OFFERING", "", "TITHE", "", "SUNDAY SCHOOL", "", "COVENANT OFFERING", "",
      "THANKSGIVING", "", "HOLY COMMUNION", "", "SPECIAL THANKSGIVING/GIFT", "",
      "FELLOWSHIP", "", "DEDICATION", "", "SOW A SEED", "",
      "PASTOR'S APPRECIATION", "", "HARVEST", "", "PROJECT SUPPORT", "", "LCC", "",
      "TOTAL", "", "",
    ];

    const headerRow2 = [
      "", "",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "TOTAL",
    ];

    const dataRows = entries.map((e) => [
      e.date,
      e.service_type,
      zeroToEmpty(e.offering_church),
      zeroToEmpty(e.offering_project),
      zeroToEmpty(e.tithe_church),
      zeroToEmpty(e.tithe_project),
      zeroToEmpty(e.sunday_school_church),
      zeroToEmpty(e.sunday_school_project),
      zeroToEmpty(e.covenant_offering_church),
      zeroToEmpty(e.covenant_offering_project),
      zeroToEmpty(e.thanksgiving_church),
      zeroToEmpty(e.thanksgiving_project),
      zeroToEmpty(e.holy_communion_church),
      zeroToEmpty(e.holy_communion_project),
      zeroToEmpty(e.special_thanksgiving_church),
      zeroToEmpty(e.special_thanksgiving_project),
      zeroToEmpty(e.fellowship_church),
      zeroToEmpty(e.fellowship_project),
      zeroToEmpty(e.dedication_church),
      zeroToEmpty(e.dedication_project),
      zeroToEmpty(e.sow_a_seed_church),
      zeroToEmpty(e.sow_a_seed_project),
      zeroToEmpty(e.pastors_appreciation_church),
      zeroToEmpty(e.pastors_appreciation_project),
      zeroToEmpty(e.harvest_church),
      zeroToEmpty(e.harvest_project),
      zeroToEmpty(e.project_support_church),
      zeroToEmpty(e.project_support_project),
      zeroToEmpty(e.lcc_church),
      zeroToEmpty(e.lcc_project),
      zeroToEmpty(e.total_church),
      zeroToEmpty(e.total_project),
      zeroToEmpty(e.grand_total),
    ]);

    const totalsRow: (string | number)[] = ["TOTALS", ""];
    const numCols = headerRow2.length - 2;
    for (let col = 0; col < numCols; col++) {
      const colValues = dataRows.map((r) => (typeof r[col + 2] === "number" ? (r[col + 2] as number) : 0));
      const sum = colValues.reduce((a, b) => a + b, 0);
      totalsRow.push(sum === 0 ? "" : sum);
    }

    const wsData = [headerRow1, headerRow2, ...dataRows, totalsRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge cells for category headers
    const merges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // DATE
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // SUNDAY SERVICE
    ];

    const categoryStartCols = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    categoryStartCols.forEach((col) => {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 1 } });
    });
    // TOTAL merge
    merges.push({ s: { r: 0, c: 30 }, e: { r: 0, c: 32 } });

    ws["!merges"] = merges;

    // Column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 18 },
      ...Array(30).fill({ wch: 12 }),
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Church Accounts");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="church-accounts-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}

function zeroToEmpty(val: unknown): number | string {
  const n = Number(val);
  return n === 0 ? "" : n;
}
