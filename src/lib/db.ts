import { createClient, Client } from "@libsql/client";
import fs from "fs";
import path from "path";

let _client: Client | null = null;
let _initialized = false;

export async function getDb(): Promise<Client> {
  if (!_client) {
    let url = process.env.TURSO_DATABASE_URL;

    if (!url) {
      // Local file-based SQLite for development
      const dbDir = path.join(process.cwd(), "data");
      fs.mkdirSync(dbDir, { recursive: true });
      url = `file:${path.join(dbDir, "church.db")}`;
    }

    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  if (!_initialized) {
    await _client.batch(
      [
        {
          sql: `CREATE TABLE IF NOT EXISTS account_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            service_type TEXT NOT NULL DEFAULT 'SUNDAY SERVICE',
            offering_church REAL NOT NULL DEFAULT 0,
            offering_project REAL NOT NULL DEFAULT 0,
            tithe_church REAL NOT NULL DEFAULT 0,
            tithe_project REAL NOT NULL DEFAULT 0,
            sunday_school_church REAL NOT NULL DEFAULT 0,
            sunday_school_project REAL NOT NULL DEFAULT 0,
            covenant_offering_church REAL NOT NULL DEFAULT 0,
            covenant_offering_project REAL NOT NULL DEFAULT 0,
            thanksgiving_church REAL NOT NULL DEFAULT 0,
            thanksgiving_project REAL NOT NULL DEFAULT 0,
            holy_communion_church REAL NOT NULL DEFAULT 0,
            holy_communion_project REAL NOT NULL DEFAULT 0,
            special_thanksgiving_church REAL NOT NULL DEFAULT 0,
            special_thanksgiving_project REAL NOT NULL DEFAULT 0,
            fellowship_church REAL NOT NULL DEFAULT 0,
            fellowship_project REAL NOT NULL DEFAULT 0,
            dedication_church REAL NOT NULL DEFAULT 0,
            dedication_project REAL NOT NULL DEFAULT 0,
            sow_a_seed_church REAL NOT NULL DEFAULT 0,
            sow_a_seed_project REAL NOT NULL DEFAULT 0,
            pastors_appreciation_church REAL NOT NULL DEFAULT 0,
            pastors_appreciation_project REAL NOT NULL DEFAULT 0,
            harvest_church REAL NOT NULL DEFAULT 0,
            harvest_project REAL NOT NULL DEFAULT 0,
            project_support_church REAL NOT NULL DEFAULT 0,
            project_support_project REAL NOT NULL DEFAULT 0,
            lcc_church REAL NOT NULL DEFAULT 0,
            lcc_project REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          args: [],
        },
        {
          sql: `CREATE TABLE IF NOT EXISTS expenditure_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            service_type TEXT NOT NULL DEFAULT 'SUNDAY SERVICE',
            transportation_church REAL NOT NULL DEFAULT 0,
            transportation_project REAL NOT NULL DEFAULT 0,
            premise_church REAL NOT NULL DEFAULT 0,
            premise_project REAL NOT NULL DEFAULT 0,
            percent25_church REAL NOT NULL DEFAULT 0,
            percent25_project REAL NOT NULL DEFAULT 0,
            gift_church REAL NOT NULL DEFAULT 0,
            gift_project REAL NOT NULL DEFAULT 0,
            battery_church REAL NOT NULL DEFAULT 0,
            battery_project REAL NOT NULL DEFAULT 0,
            fuel_church REAL NOT NULL DEFAULT 0,
            fuel_project REAL NOT NULL DEFAULT 0,
            electricity_church REAL NOT NULL DEFAULT 0,
            electricity_project REAL NOT NULL DEFAULT 0,
            lcc_dcc_church REAL NOT NULL DEFAULT 0,
            lcc_dcc_project REAL NOT NULL DEFAULT 0,
            entertainment_church REAL NOT NULL DEFAULT 0,
            entertainment_project REAL NOT NULL DEFAULT 0,
            pastors_appreciation_church REAL NOT NULL DEFAULT 0,
            pastors_appreciation_project REAL NOT NULL DEFAULT 0,
            stationeries_church REAL NOT NULL DEFAULT 0,
            stationeries_project REAL NOT NULL DEFAULT 0,
            accessories_church REAL NOT NULL DEFAULT 0,
            accessories_project REAL NOT NULL DEFAULT 0,
            phcn_church REAL NOT NULL DEFAULT 0,
            phcn_project REAL NOT NULL DEFAULT 0,
            assessment_church REAL NOT NULL DEFAULT 0,
            assessment_project REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          args: [],
        },
      ],
      "write"
    );
    _initialized = true;
  }

  return _client;
}

export default getDb;
