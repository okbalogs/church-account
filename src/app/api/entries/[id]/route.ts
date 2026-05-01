import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { AccountEntry } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const entry = db
      .prepare("SELECT * FROM account_entries WHERE id = ?")
      .get(Number(params.id));

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error("GET /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<AccountEntry, "id" | "created_at"> = await request.json();
    const db = getDb();

    const stmt = db.prepare(`
      UPDATE account_entries SET
        date = @date, service_type = @service_type,
        offering_church = @offering_church, offering_project = @offering_project,
        tithe_church = @tithe_church, tithe_project = @tithe_project,
        sunday_school_church = @sunday_school_church, sunday_school_project = @sunday_school_project,
        covenant_offering_church = @covenant_offering_church, covenant_offering_project = @covenant_offering_project,
        thanksgiving_church = @thanksgiving_church, thanksgiving_project = @thanksgiving_project,
        holy_communion_church = @holy_communion_church, holy_communion_project = @holy_communion_project,
        special_thanksgiving_church = @special_thanksgiving_church, special_thanksgiving_project = @special_thanksgiving_project,
        fellowship_church = @fellowship_church, fellowship_project = @fellowship_project,
        dedication_church = @dedication_church, dedication_project = @dedication_project,
        sow_a_seed_church = @sow_a_seed_church, sow_a_seed_project = @sow_a_seed_project,
        pastors_appreciation_church = @pastors_appreciation_church, pastors_appreciation_project = @pastors_appreciation_project,
        harvest_church = @harvest_church, harvest_project = @harvest_project,
        project_support_church = @project_support_church, project_support_project = @project_support_project,
        lcc_church = @lcc_church, lcc_project = @lcc_project
      WHERE id = @id
    `);

    stmt.run({ ...body, id: Number(params.id) });

    const updated = db
      .prepare("SELECT * FROM account_entries WHERE id = ?")
      .get(Number(params.id));

    if (!updated) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/entries/[id] error:", error);
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
      .prepare("DELETE FROM account_entries WHERE id = ?")
      .run(Number(params.id));

    if (result.changes === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/entries/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
