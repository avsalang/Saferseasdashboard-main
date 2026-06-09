import test from "node:test";
import assert from "node:assert/strict";
import type { ActiveFilters, AnalyticsRecord } from "./types.ts";
import { buildPolicyPriorityItems } from "./policyEvidence.ts";

function buildRecord(index: number, overrides: Partial<AnalyticsRecord> = {}): AnalyticsRecord {
  return {
    id: `INC-${index}`,
    incidentId: `INC-${index}`,
    date: `2026-03-${String((index % 20) + 1).padStart(2, "0")}T06:40:00Z`,
    incidentDateTime: `2026-03-${String((index % 20) + 1).padStart(2, "0")}T06:40:00Z`,
    incidentYear: 2026,
    incidentQuarter: "Q1",
    incidentMonth: 3,
    incidentMonthKey: "2026-03",
    incidentMonthLabel: "Mar 26",
    type: "Collision",
    incidentType: "Collision",
    casualtyType: "Injury",
    severity: index % 4 === 0 ? "Very Serious" : "Serious",
    severityLevel: index % 4 === 0 ? "Very Serious" : "Serious",
    vesselName: `MV Test ${index}`,
    vesselType: "Ferry",
    vesselTypeClass: "Ferry",
    flagState: "Philippines",
    location: { lat: 14.2, lng: 120.9, port: "Manila", province: index < 12 ? "Metro Manila" : "Batangas" },
    province: index < 12 ? "Metro Manila" : "Batangas",
    nearestPort: "Manila",
    weather: { waveHeight: index % 3 === 0 ? 2.8 : 1.1, windForce: index % 3 === 0 ? 6 : 3, visibility: index % 3 === 0 ? "Poor" : "Good" },
    reportingAuthority: "MARINA",
    authority: "MARINA",
    methodOfReporting: "Web Portal",
    reportingMethod: "Web Portal",
    reviewStatus: index % 5 === 0 ? "Under Review" : "Published",
    status: index % 5 === 0 ? "Under Review" : "Published",
    narrative: "Narrative present",
    fatalities: index % 4 === 0 ? 1 : 0,
    injuries: 2,
    fatalitiesCount: index % 4 === 0 ? 1 : 0,
    injuriesCount: 2,
    totalCasualties: index % 4 === 0 ? 3 : 2,
    totalPersonsOnboard: 12,
    causeCategory: "Navigation error",
    weatherConditionCategory: index % 3 === 0 ? "Adverse conditions" : "Good conditions",
    linkedEvidenceStatus: "Linked evidence",
    vesselAge: 12,
    vesselAgeBand: "11-20",
    routeKey: index < 10 ? "batangas -> calapan" : "manila -> cebu",
    routeLabel: index < 10 ? "Batangas -> Calapan" : "Manila -> Cebu",
    hasCoordinates: true,
    hasLinkedEvidence: true,
    hasVerifiedCauseFindings: true,
    hasWeatherContext: true,
    minimumDatasetComplete: true,
    linkedDocuments: ["Report"],
    findingsOfCause: "Findings present",
    recommendations: "Recommendation",
    voyageOrigin: index < 10 ? "Batangas" : "Manila",
    voyageDestination: index < 10 ? "Calapan" : "Cebu",
    crewCount: 5,
    passengerCount: 7,
    ...overrides,
  };
}

const filters: ActiveFilters = {
  year: "all",
  quarter: "all",
  incidentTypes: ["Collision"],
  severities: ["Very Serious", "Serious"],
  provinces: ["Metro Manila", "Batangas"],
  vesselTypes: ["Ferry"],
  reportingChannels: ["Web Portal"],
  authorities: ["MARINA"],
  reviewStatuses: ["Published", "Under Review"],
  routeLabels: ["Batangas -> Calapan", "Manila -> Cebu"],
  causeCategories: ["Navigation error"],
  weatherCategories: ["Good conditions", "Adverse conditions"],
  vesselAgeBands: ["11-20"],
  linkedEvidenceStatuses: ["Linked evidence"],
};

test("policy evidence generation produces burden-backed review items", () => {
  const records = Array.from({ length: 18 }, (_, index) => buildRecord(index + 1));
  const items = buildPolicyPriorityItems(records, filters);

  assert.ok(items.length >= 5);
  assert.ok(items.some((item) => item.id === "leading-incident-type"));
  assert.ok(items.some((item) => item.id === "location-concentration"));
  assert.ok(items.some((item) => item.id === "route-review"));
  assert.ok(items.every((item) => item.dataLimitation.length > 0));
  assert.ok(items.every((item) => ["High", "Medium", "Low"].includes(item.confidence)));
});
