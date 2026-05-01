export type ServiceType =
  | "SUNDAY SERVICE"
  | "ECC DAY"
  | "GLORY CONVENTION"
  | "SPECIAL SERVICE"
  | "OTHER";

export interface CategoryAmounts {
  church: number;
  project: number;
}

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

export const SERVICE_TYPES: ServiceType[] = [
  "SUNDAY SERVICE",
  "ECC DAY",
  "GLORY CONVENTION",
  "SPECIAL SERVICE",
  "OTHER",
];
