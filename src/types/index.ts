export type ServiceType =
  | "SUNDAY SERVICE"
  | "ECC DAY"
  | "GLORY CONVENTION"
  | "SPECIAL SERVICE"
  | "OTHER";

export const SERVICE_TYPES: ServiceType[] = [
  "SUNDAY SERVICE",
  "ECC DAY",
  "GLORY CONVENTION",
  "SPECIAL SERVICE",
  "OTHER",
];

// ── INCOME ──────────────────────────────────────────────────────────────────

export interface AccountEntry {
  id?: number;
  date: string;
  service_type: ServiceType;
  offering_church: number;
  offering_project: number;
  tithe_church: number;
  tithe_project: number;
  sunday_school_church: number;
  sunday_school_project: number;
  covenant_offering_church: number;
  covenant_offering_project: number;
  thanksgiving_church: number;
  thanksgiving_project: number;
  holy_communion_church: number;
  holy_communion_project: number;
  special_thanksgiving_church: number;
  special_thanksgiving_project: number;
  fellowship_church: number;
  fellowship_project: number;
  dedication_church: number;
  dedication_project: number;
  sow_a_seed_church: number;
  sow_a_seed_project: number;
  pastors_appreciation_church: number;
  pastors_appreciation_project: number;
  harvest_church: number;
  harvest_project: number;
  project_support_church: number;
  project_support_project: number;
  lcc_church: number;
  lcc_project: number;
  created_at?: string;
}

export interface AccountEntryTotals extends AccountEntry {
  total_church: number;
  total_project: number;
  grand_total: number;
}

export const ACCOUNT_CATEGORIES = [
  { key: "offering", label: "Offering" },
  { key: "tithe", label: "Tithe" },
  { key: "sunday_school", label: "Sunday School" },
  { key: "covenant_offering", label: "Covenant Offering" },
  { key: "thanksgiving", label: "Thanksgiving" },
  { key: "holy_communion", label: "Holy Communion" },
  { key: "special_thanksgiving", label: "Special Thanksgiving / Gift" },
  { key: "fellowship", label: "Fellowship" },
  { key: "dedication", label: "Dedication" },
  { key: "sow_a_seed", label: "Sow A Seed" },
  { key: "pastors_appreciation", label: "Pastor's Appreciation" },
  { key: "harvest", label: "Harvest" },
  { key: "project_support", label: "Project Support" },
  { key: "lcc", label: "LCC" },
] as const;

export type CategoryKey = (typeof ACCOUNT_CATEGORIES)[number]["key"];

// ── EXPENDITURE ──────────────────────────────────────────────────────────────

export interface ExpenditureEntry {
  id?: number;
  date: string;
  service_type: ServiceType;
  transportation_church: number;
  transportation_project: number;
  premise_church: number;
  premise_project: number;
  percent25_church: number;
  percent25_project: number;
  gift_church: number;
  gift_project: number;
  battery_church: number;
  battery_project: number;
  fuel_church: number;
  fuel_project: number;
  electricity_church: number;
  electricity_project: number;
  lcc_dcc_church: number;
  lcc_dcc_project: number;
  entertainment_church: number;
  entertainment_project: number;
  pastors_appreciation_church: number;
  pastors_appreciation_project: number;
  stationeries_church: number;
  stationeries_project: number;
  accessories_church: number;
  accessories_project: number;
  phcn_church: number;
  phcn_project: number;
  assessment_church: number;
  assessment_project: number;
  created_at?: string;
}

export interface ExpenditureEntryTotals extends ExpenditureEntry {
  total_church: number;
  total_project: number;
  grand_total: number;
}

export const EXPENDITURE_CATEGORIES = [
  { key: "transportation", label: "Transportation" },
  { key: "premise", label: "Premise" },
  { key: "percent25", label: "25%" },
  { key: "gift", label: "Gift" },
  { key: "battery", label: "Battery" },
  { key: "fuel", label: "Fuel" },
  { key: "electricity", label: "Electricity" },
  { key: "lcc_dcc", label: "LCC/DCC" },
  { key: "entertainment", label: "Entertainment" },
  { key: "pastors_appreciation", label: "Pastor's Appreciation" },
  { key: "stationeries", label: "Stationeries" },
  { key: "accessories", label: "Accessories" },
  { key: "phcn", label: "PHCN" },
  { key: "assessment", label: "Assessment" },
] as const;

export type ExpenditureCategoryKey = (typeof EXPENDITURE_CATEGORIES)[number]["key"];
