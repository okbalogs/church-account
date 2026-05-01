import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { ExpenditureEntry } from "@/types";

const TOTAL_SQL = `
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
`;

export async function GET() {
  try {
    const db = getDb();
    const entries = db
      .prepare(`SELECT *, ${TOTAL_SQL} FROM expenditure_entries ORDER BY date DESC, id DESC`)
      .all();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/expenditure error:", error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<ExpenditureEntry, "id" | "created_at"> = await request.json();
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO expenditure_entries (
        date, service_type,
        transportation_church, transportation_project,
        premise_church, premise_project,
        percent25_church, percent25_project,
        gift_church, gift_project,
        battery_church, battery_project,
        fuel_church, fuel_project,
        electricity_church, electricity_project,
        lcc_dcc_church, lcc_dcc_project,
        entertainment_church, entertainment_project,
        pastors_appreciation_church, pastors_appreciation_project,
        stationeries_church, stationeries_project,
        accessories_church, accessories_project,
        phcn_church, phcn_project,
        assessment_church, assessment_project
      ) VALUES (
        @date, @service_type,
        @transportation_church, @transportation_project,
        @premise_church, @premise_project,
        @percent25_church, @percent25_project,
        @gift_church, @gift_project,
        @battery_church, @battery_project,
        @fuel_church, @fuel_project,
        @electricity_church, @electricity_project,
        @lcc_dcc_church, @lcc_dcc_project,
        @entertainment_church, @entertainment_project,
        @pastors_appreciation_church, @pastors_appreciation_project,
        @stationeries_church, @stationeries_project,
        @accessories_church, @accessories_project,
        @phcn_church, @phcn_project,
        @assessment_church, @assessment_project
      )
    `);

    const result = stmt.run(body);
    const newEntry = db
      .prepare("SELECT * FROM expenditure_entries WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenditure error:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
