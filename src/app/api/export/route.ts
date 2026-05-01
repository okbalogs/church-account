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
      FROM account_entries ORDER BY date ASC, id ASC
    `);

    const entries = result.rows as Record<string, unknown>[];

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
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "CHURCH", "PROJECT",
      "CHURCH", "PROJECT", "TOTAL",
    ];

    const dataRows = entries.map((e) => [
      e.date, e.service_type,
      z(e.offering_church), z(e.offering_project),
      z(e.tithe_church), z(e.tithe_project),
      z(e.sunday_school_church), z(e.sunday_school_project),
      z(e.covenant_offering_church), z(e.covenant_offering_project),
      z(e.thanksgiving_church), z(e.thanksgiving_project),
      z(e.holy_communion_church), z(e.holy_communion_project),
      z(e.special_thanksgiving_church), z(e.special_thanksgiving_project),
      z(e.fellowship_church), z(e.fellowship_project),
      z(e.dedication_church), z(e.dedication_project),
      z(e.sow_a_seed_church), z(e.sow_a_seed_project),
      z(e.pastors_appreciation_church), z(e.pastors_appreciation_project),
      z(e.harvest_church), z(e.harvest_project),
      z(e.project_support_church), z(e.project_support_project),
      z(e.lcc_church), z(e.lcc_project),
      z(e.total_church), z(e.total_project), z(e.grand_total),
    ]);

    const totalsRow: (string | number)[] = ["TOTALS", ""];
    for (let col = 0; col < headerRow2.length - 2; col++) {
      const sum = dataRows.reduce((a, r) => a + (typeof r[col + 2] === "number" ? (r[col + 2] as number) : 0), 0);
      totalsRow.push(sum === 0 ? "" : sum);
    }

    const ws = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...dataRows, totalsRow]);

    const merges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    ];
    [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28].forEach((col) => {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + 1 } });
    });
    merges.push({ s: { r: 0, c: 30 }, e: { r: 0, c: 32 } });
    ws["!merges"] = merges;
    ws["!cols"] = [{ wch: 12 }, { wch: 18 }, ...Array(31).fill({ wch: 12 })];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Church Accounts");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="church-income-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}

function z(val: unknown): number | string {
  const n = Number(val);
  return n === 0 ? "" : n;
}
