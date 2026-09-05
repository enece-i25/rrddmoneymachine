export type PackageName = "basic" | "standard" | "pro" | "recurring";
export interface PackageDefinition {
    name: PackageName;
    durationMinutes: number;
    collaborators: number;
    priceUsd: number;
    sessionsPerMonth?: number;
}
export declare const PACKAGE_CATALOG: Record<PackageName, PackageDefinition>;
