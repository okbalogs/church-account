import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { AccountEntry } from "@/types";

const TOTALS = `
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
`;

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.execute(
      `SELECT *, ${TOTALS} FROM account_entries ORDER BY date DESC, id DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/entries error:", error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<AccountEntry, "id" | "created_at"> = await request.json();
    const db = await getDb();

    const result = await db.execute({
      sql: `INSERT INTO account_entries (
        date, service_type,
        offering_church, offering_project,
        tithe_church, tithe_project,
        sunday_school_church, sunday_school_project,
        covenant_offering_church, covenant_offering_project,
        thanksgiving_church, thanksgiving_project,
        holy_communion_church, holy_communion_project,
        special_thanksgiving_church, special_thanksgiving_project,
        fellowship_church, fellowship_project,
        dedication_church, dedication_project,
        sow_a_seed_church, sow_a_seed_project,
        pastors_appreciation_church, pastors_appreciation_project,
        harvest_church, harvest_project,
        project_support_church, project_support_project,
        lcc_church, lcc_project
      ) VALUES (
        :date, :service_type,
        :offering_church, :offering_project,
        :tithe_church, :tithe_project,
        :sunday_school_church, :sunday_school_project,
        :covenant_offering_church, :covenant_offering_project,
        :thanksgiving_church, :thanksgiving_project,
        :holy_communion_church, :holy_communion_project,
        :special_thanksgiving_church, :special_thanksgiving_project,
        :fellowship_church, :fellowship_project,
        :dedication_church, :dedication_project,
        :sow_a_seed_church, :sow_a_seed_project,
        :pastors_appreciation_church, :pastors_appreciation_project,
        :harvest_church, :harvest_project,
        :project_support_church, :project_support_project,
        :lcc_church, :lcc_project
      )`,
      args: body as Record<string, string | number | null>,
    });

    const newEntry = await db.execute({
      sql: "SELECT * FROM account_entries WHERE id = ?",
      args: [Number(result.lastInsertRowid)],
    });

    return NextResponse.json(newEntry.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/entries error:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
