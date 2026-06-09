import { mockIncidents } from "../data/mockIncidents.ts";
import { isMinimumDatasetComplete } from "./dataQuality.ts";
import { buildAnalyticsRecord } from "./metrics.ts";

export const analyticsRecords = mockIncidents
  .map((incident) => buildAnalyticsRecord(incident))
  .map((record) => ({
    ...record,
    minimumDatasetComplete: isMinimumDatasetComplete(record),
  }))
  .sort((left, right) => new Date(right.incidentDateTime).getTime() - new Date(left.incidentDateTime).getTime());

export * from "./constants.ts";
export * from "./types.ts";
export * from "./metrics.ts";
export * from "./dataQuality.ts";
export * from "./chartData.ts";
export * from "./policyEvidence.ts";
