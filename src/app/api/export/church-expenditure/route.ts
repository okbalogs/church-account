import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.execute(`
      SELECT *,
        (transportation_church + premise_church + percent25_church + gift_church +
         battery_church + fuel_church + electricity_church + lcc_dcc_church +
         entertainment_church + pastors_appreciation_church + stationeries_church +
         accessories_church + phcn_church + assessment_church) AS total_church
      FROM expenditure_entries ORDER BY date ASC, id ASC
    `);

    const entries = result.rows as Record<string, unknown>[];

    const headerRow1 = [
      "DATE", "SUNDAY SERVICE",
      "TRANSPORTATION", "PREMISE", "25%", "GIFT",
      "BATTERY", "FUEL", "ELECTRICITY", "LCC/DCC",
      "ENTERTAINMENT", "PASTOR'S APPRECIATION", "STATIONERIES",
      "ACCESSORIES", "PHCN", "ASSESSMENT",
      "TOTAL (CHURCH)",
    ];

    const dataRows = entries.map((e) => [
      e.date, e.service_type,
      z(e.transportation_church),
      z(e.premise_church),
      z(e.percent25_church),
      z(e.gift_church),
      z(e.battery_church),
      z(e.fuel_church),
      z(e.electricity_church),
      z(e.lcc_dcc_church),
      z(e.entertainment_church),
      z(e.pastors_appreciation_church),
      z(e.stationeries_church),
      z(e.accessories_church),
      z(e.phcn_church),
      z(e.assessment_church),
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
    XLSX.utils.book_append_sheet(wb, ws, "Church Expenditure");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="church-expenditure-only-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export/church-expenditure error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}

function z(val: unknown): number | string {
  const n = Number(val);
  return n === 0 ? "" : n;
}
