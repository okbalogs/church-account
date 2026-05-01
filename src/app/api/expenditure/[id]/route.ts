import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { ExpenditureEntry } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const entry = db
      .prepare("SELECT * FROM expenditure_entries WHERE id = ?")
      .get(Number(params.id));
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<ExpenditureEntry, "id" | "created_at"> = await request.json();
    const db = getDb();

    db.prepare(`
      UPDATE expenditure_entries SET
        date = @date, service_type = @service_type,
        transportation_church = @transportation_church, transportation_project = @transportation_project,
        premise_church = @premise_church, premise_project = @premise_project,
        percent25_church = @percent25_church, percent25_project = @percent25_project,
        gift_church = @gift_church, gift_project = @gift_project,
        battery_church = @battery_church, battery_project = @battery_project,
        fuel_church = @fuel_church, fuel_project = @fuel_project,
        electricity_church = @electricity_church, electricity_project = @electricity_project,
        lcc_dcc_church = @lcc_dcc_church, lcc_dcc_project = @lcc_dcc_project,
        entertainment_church = @entertainment_church, entertainment_project = @entertainment_project,
        pastors_appreciation_church = @pastors_appreciation_church, pastors_appreciation_project = @pastors_appreciation_project,
        stationeries_church = @stationeries_church, stationeries_project = @stationeries_project,
        accessories_church = @accessories_church, accessories_project = @accessories_project,
        phcn_church = @phcn_church, phcn_project = @phcn_project,
        assessment_church = @assessment_church, assessment_project = @assessment_project
      WHERE id = @id
    `).run({ ...body, id: Number(params.id) });

    const updated = db
      .prepare("SELECT * FROM expenditure_entries WHERE id = ?")
      .get(Number(params.id));
    if (!updated) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const result = db
      .prepare("DELETE FROM expenditure_entries WHERE id = ?")
      .run(Number(params.id));
    if (result.changes === 0)
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
