export type PackageName = "basic" | "standard" | "pro" | "recurring";

export interface PackageDefinition {
  name: PackageName;
  durationMinutes: number;
  collaborators: number;
  priceUsd: number;
  sessionsPerMonth?: number;
}

export const PACKAGE_CATALOG: Record<PackageName, PackageDefinition> = {
  basic: {
    name: "basic",
    durationMinutes: 30,
    collaborators: 3,
    priceUsd: 5.25
  },
  standard: {
    name: "standard",
    durationMinutes: 60,
    collaborators: 5,
    priceUsd: 16.0
  },
  pro: {
    name: "pro",
    durationMinutes: 120,
    collaborators: 10,
    priceUsd: 60.0
  },
  recurring: {
    name: "recurring",
    durationMinutes: 60,
    collaborators: 5,
    priceUsd: 186.0,
    sessionsPerMonth: 12
  }
};
