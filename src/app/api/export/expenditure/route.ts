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
         accessories_church + phcn_church + assessment_church) AS total_church,
        (transportation_project + premise_project + percent25_project + gift_project +
         battery_project + fuel_project + electricity_project + lcc_dcc_project +
         entertainment_project + pastors_appreciation_project + stationeries_project +
         accessories_project + phcn_project + assessment_project) AS total_project,
        (transportation_church + premise_church + percent25_church + gift_church +
         battery_church + fuel_church + electricity_church + lcc_dcc_church +
         entertainment_church + pastors_appreciation_church + stationeries_church +
         accessories_church + phcn_church + assessment_church +
         transportation_project + premise_project + percent25_project + gift_project +
         battery_project + fuel_project + electricity_project + lcc_dcc_project +
         entertainment_project + pastors_appreciation_project + stationeries_project +
         accessories_project + phcn_project + assessment_project) AS grand_total
      FROM expenditure_entries ORDER BY date ASC, id ASC
    `);

    const entries = result.rows as Record<string, unknown>[];

    const headerRow1 = [
      "DATE", "SUNDAY SERVICE",
      "TRANSPORTATION", "", "PREMISE", "", "25%", "", "GIFT", "",
      "BATTERY", "", "FUEL", "", "ELECTRICITY", "", "LCC/DCC", "",
      "ENTERTAINMENT", "", "PASTOR'S APPRECIATION", "", "STATIONERIES", "",
      "ACCESSORIES", "", "PHCN", "", "ASSESSMENT", "",
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
      z(e.transportation_church), z(e.transportation_project),
      z(e.premise_church), z(e.premise_project),
      z(e.percent25_church), z(e.percent25_project),
      z(e.gift_church), z(e.gift_project),
      z(e.battery_church), z(e.battery_project),
      z(e.fuel_church), z(e.fuel_project),
      z(e.electricity_church), z(e.electricity_project),
      z(e.lcc_dcc_church), z(e.lcc_dcc_project),
      z(e.entertainment_church), z(e.entertainment_project),
      z(e.pastors_appreciation_church), z(e.pastors_appreciation_project),
      z(e.stationeries_church), z(e.stationeries_project),
      z(e.accessories_church), z(e.accessories_project),
      z(e.phcn_church), z(e.phcn_project),
      z(e.assessment_church), z(e.assessment_project),
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
    XLSX.utils.book_append_sheet(wb, ws, "Expenditure");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="church-expenditure-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export/expenditure error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}

function z(val: unknown): number | string {
  const n = Number(val);
  return n === 0 ? "" : n;
}
