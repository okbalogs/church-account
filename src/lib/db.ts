import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "church.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS account_entries (
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
    );

    CREATE TABLE IF NOT EXISTS expenditure_entries (
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
    );
  `);

  return db;
}

export default getDb;
