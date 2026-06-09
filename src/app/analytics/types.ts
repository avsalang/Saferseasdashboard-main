import type { Incident } from "../data/mockIncidents";

export type SeverityLevel = "Very Serious" | "Serious" | "Less Serious" | "Near Miss" | "Unknown";
export type ReviewStatus = "Submitted" | "Under Review" | "Verified" | "Published" | "Returned" | "Unknown";
export type CompletenessStatus = "complete" | "missing" | "unknown" | "not_applicable" | "needs_verification";
export type ConfidenceLabel = "High" | "Medium" | "Low";

export interface AnalyticsRecord extends Incident {
  incidentId: string;
  incidentDateTime: string;
  incidentYear: number;
  incidentQuarter: "Q1" | "Q2" | "Q3" | "Q4";
  incidentMonth: number;
  incidentMonthKey: string;
  incidentMonthLabel: string;
  incidentType: string;
  severityLevel: SeverityLevel;
  fatalitiesCount: number;
  injuriesCount: number;
  totalCasualties: number;
  totalPersonsOnboard: number;
  province: string;
  nearestPort: string;
  vesselTypeClass: string;
  reportingAuthority: string;
  methodOfReporting: string;
  reviewStatus: ReviewStatus;
  causeCategory: string;
  weatherConditionCategory: string;
  linkedEvidenceStatus: string;
  vesselAge: number | null;
  vesselAgeBand: string;
  routeKey: string;
  routeLabel: string;
  hasCoordinates: boolean;
  hasLinkedEvidence: boolean;
  hasVerifiedCauseFindings: boolean;
  hasWeatherContext: boolean;
  minimumDatasetComplete: boolean;
}

export interface ActiveFilters {
  year: string;
  quarter: string;
  incidentTypes: string[];
  severities: string[];
  provinces: string[];
  vesselTypes: string[];
  reportingChannels: string[];
  authorities: string[];
  reviewStatuses: string[];
  routeLabels: string[];
  causeCategories: string[];
  weatherCategories: string[];
  vesselAgeBands: string[];
  linkedEvidenceStatuses: string[];
}

export interface FilterOptions {
  years: string[];
  incidentTypes: string[];
  severities: string[];
  provinces: string[];
  vesselTypes: string[];
  reportingChannels: string[];
  authorities: string[];
  reviewStatuses: string[];
  routeLabels: string[];
  causeCategories: string[];
  weatherCategories: string[];
  vesselAgeBands: string[];
  linkedEvidenceStatuses: string[];
}

export interface GroupCompletenessMetric {
  label: string;
  complete: number;
  missing: number;
  unknown: number;
  notApplicable: number;
  needsVerification: number;
  total: number;
  completePct: number;
}

export interface EvidenceStrengthSummary {
  sampleSize: number;
  requiredFieldCompletenessPct: number;
  geocodedRecords: number;
  verifiedCauseRecords: number;
  linkedEvidenceRecords: number;
  weatherContextRecords: number;
  possibleDuplicateRecords: number;
}

export interface PolicyPriorityItem {
  id: string;
  reviewArea: string;
  evidenceSignal: string;
  supportingFigureId: string;
  supportingMetric: string;
  recommendedFollowUp: string;
  responsibleUnit?: string;
  confidence: ConfidenceLabel;
  dataLimitation: string;
  includeInExport: boolean;
}

export interface ConfidenceInput {
  sampleSize: number;
  requiredFieldCompletenessPct: number;
  relevantFieldCompletenessPct: number;
  hasEvidenceSupport: boolean;
}
