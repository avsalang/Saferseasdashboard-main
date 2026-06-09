import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyticsRecord } from "./types.ts";
import { getConfidenceLabel } from "./policyEvidence.ts";
import { getMinimumDatasetCompleteness, isMinimumDatasetComplete } from "./dataQuality.ts";

function buildRecord(overrides: Partial<AnalyticsRecord> = {}): AnalyticsRecord {
  return {
    id: "INC-1",
    incidentId: "INC-1",
    date: "2026-03-10T06:40:00Z",
    incidentDateTime: "2026-03-10T06:40:00Z",
    incidentYear: 2026,
    incidentQuarter: "Q1",
    incidentMonth: 3,
    incidentMonthKey: "2026-03",
    incidentMonthLabel: "Mar 26",
    type: "Collision",
    incidentType: "Collision",
    casualtyType: "Injury",
    severity: "Serious",
    severityLevel: "Serious",
    vesselName: "MV Test",
    vesselType: "Ferry",
    vesselTypeClass: "Ferry",
    flagState: "Philippines",
    location: { lat: 14.2, lng: 120.9, port: "Manila", province: "Metro Manila" },
    province: "Metro Manila",
    nearestPort: "Manila",
    weather: { waveHeight: 1.5, windForce: 4, visibility: "Moderate" },
    reportingAuthority: "MARINA",
    authority: "MARINA",
    methodOfReporting: "Web Portal",
    reportingMethod: "Web Portal",
    reviewStatus: "Published",
    status: "Published",
    narrative: "Narrative present",
    fatalities: 1,
    injuries: 2,
    fatalitiesCount: 1,
    injuriesCount: 2,
    totalCasualties: 3,
    totalPersonsOnboard: 12,
    causeCategory: "Navigation error",
    weatherConditionCategory: "Moderate conditions",
    linkedEvidenceStatus: "Linked evidence",
    vesselAge: 12,
    vesselAgeBand: "11-20",
    routeKey: "batangas -> calapan",
    routeLabel: "Batangas -> Calapan",
    hasCoordinates: true,
    hasLinkedEvidence: true,
    hasVerifiedCauseFindings: true,
    hasWeatherContext: true,
    minimumDatasetComplete: true,
    linkedDocuments: ["Report"],
    findingsOfCause: "Findings present",
    recommendations: "Recommendation",
    voyageOrigin: "Batangas",
    voyageDestination: "Calapan",
    crewCount: 5,
    passengerCount: 7,
    ...overrides,
  };
}

test("minimum dataset completeness follows required field rule", () => {
  const complete = buildRecord();
  const incomplete = buildRecord({
    incidentId: "",
    id: "",
    narrative: "",
    hasCoordinates: false,
    nearestPort: "",
    province: "",
    location: { lat: NaN, lng: NaN, port: "", province: "" },
  });

  assert.equal(isMinimumDatasetComplete(complete), true);
  assert.equal(isMinimumDatasetComplete(incomplete), false);
  const summary = getMinimumDatasetCompleteness([complete, incomplete]);
  assert.deepEqual(summary, { complete: 1, total: 2, percentage: 50 });
});

test("confidence scoring follows rule-based thresholds", () => {
  assert.equal(
    getConfidenceLabel({
      sampleSize: 32,
      requiredFieldCompletenessPct: 88,
      relevantFieldCompletenessPct: 84,
      hasEvidenceSupport: true,
    }),
    "High",
  );
  assert.equal(
    getConfidenceLabel({
      sampleSize: 12,
      requiredFieldCompletenessPct: 62,
      relevantFieldCompletenessPct: 65,
      hasEvidenceSupport: false,
    }),
    "Medium",
  );
  assert.equal(
    getConfidenceLabel({
      sampleSize: 8,
      requiredFieldCompletenessPct: 95,
      relevantFieldCompletenessPct: 95,
      hasEvidenceSupport: true,
    }),
    "Low",
  );
});
