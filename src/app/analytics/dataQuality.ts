import type { AnalyticsRecord, CompletenessStatus, EvidenceStrengthSummary, GroupCompletenessMetric } from "./types.ts";
import { FIELD_GROUP_ORDER } from "./constants.ts";
import { normalizeWhitespace } from "./metrics.ts";

function statusFromValue(value: unknown): CompletenessStatus {
  if (value === null || value === undefined) {
    return "missing";
  }

  if (Array.isArray(value)) {
    return value.length ? "complete" : "missing";
  }

  if (typeof value === "string") {
    const normalized = normalizeWhitespace(value).toLowerCase();
    if (!normalized) {
      return "missing";
    }
    if (["unknown", "unspecified", "not known"].includes(normalized)) {
      return "unknown";
    }
    if (["not applicable", "n/a"].includes(normalized)) {
      return "not_applicable";
    }
    if (normalized.includes("pending") || normalized.includes("to be determined")) {
      return "needs_verification";
    }
    return "complete";
  }

  return "complete";
}

function summarizeStatuses(statuses: CompletenessStatus[]) {
  if (statuses.every((status) => status === "complete")) {
    return "complete";
  }
  if (statuses.includes("needs_verification")) {
    return "needs_verification";
  }
  if (statuses.includes("missing")) {
    return "missing";
  }
  if (statuses.includes("unknown")) {
    return "unknown";
  }
  return "not_applicable";
}

export function hasMinimumDatasetLocation(record: AnalyticsRecord) {
  return record.hasCoordinates || Boolean(record.nearestPort) || Boolean(record.province);
}

export function hasMinimumDatasetVesselIdentifier(record: AnalyticsRecord) {
  return Boolean(normalizeWhitespace(record.vesselName) || normalizeWhitespace(record.imoNumber) || normalizeWhitespace(record.officialNumber));
}

export function isMinimumDatasetComplete(record: AnalyticsRecord) {
  return Boolean(
    normalizeWhitespace(record.incidentId) &&
      normalizeWhitespace(record.incidentDateTime) &&
      normalizeWhitespace(record.incidentType) &&
      normalizeWhitespace(record.severityLevel) &&
      hasMinimumDatasetLocation(record) &&
      hasMinimumDatasetVesselIdentifier(record) &&
      normalizeWhitespace(record.reportingAuthority) &&
      normalizeWhitespace(record.narrative),
  );
}

export function getMinimumDatasetCompleteness(records: AnalyticsRecord[]) {
  const complete = records.filter(isMinimumDatasetComplete).length;
  const total = records.length;
  return {
    complete,
    total,
    percentage: total ? Math.round((complete / total) * 100) : 0,
  };
}

export function getFieldGroupStatus(record: AnalyticsRecord, label: string): CompletenessStatus {
  switch (label) {
    case "Core identifiers":
      return summarizeStatuses([
        statusFromValue(record.incidentId),
        statusFromValue(record.incidentDateTime),
        statusFromValue(record.incidentType),
        statusFromValue(record.severityLevel),
      ]);
    case "Location details":
      return summarizeStatuses([
        record.hasCoordinates || statusFromValue(record.nearestPort) === "complete" || statusFromValue(record.province) === "complete"
          ? "complete"
          : "missing",
        record.hasWeatherContext ? "complete" : "missing",
      ]);
    case "Vessel registry":
      return summarizeStatuses([
        hasMinimumDatasetVesselIdentifier(record) ? "complete" : "missing",
        statusFromValue(record.vesselTypeClass),
        statusFromValue(record.flagState),
      ]);
    case "Ownership / operator":
      return summarizeStatuses([
        normalizeWhitespace(record.ownerName) || normalizeWhitespace(record.operatorName) ? "complete" : "missing",
      ]);
    case "Voyage / route":
      return summarizeStatuses([
        statusFromValue(record.voyageOrigin),
        normalizeWhitespace(record.voyageDestination) || normalizeWhitespace(record.intendedRoute) ? "complete" : "missing",
      ]);
    case "Cause and investigation":
      return summarizeStatuses([
        statusFromValue(record.narrative),
        statusFromValue(record.findingsOfCause),
        statusFromValue(record.recommendations),
      ]);
    case "Linked evidence":
      return summarizeStatuses([record.hasLinkedEvidence ? "complete" : "missing"]);
    default:
      return "unknown";
  }
}

export function getFieldGroupCompleteness(records: AnalyticsRecord[], label: string): GroupCompletenessMetric {
  const counts = {
    complete: 0,
    missing: 0,
    unknown: 0,
    notApplicable: 0,
    needsVerification: 0,
  };

  records.forEach((record) => {
    const status = getFieldGroupStatus(record, label);
    if (status === "complete") {
      counts.complete += 1;
    } else if (status === "missing") {
      counts.missing += 1;
    } else if (status === "unknown") {
      counts.unknown += 1;
    } else if (status === "not_applicable") {
      counts.notApplicable += 1;
    } else {
      counts.needsVerification += 1;
    }
  });

  const total = records.length;
  return {
    label,
    ...counts,
    total,
    completePct: total ? Math.round((counts.complete / total) * 100) : 0,
  };
}

export function getAllFieldGroupCompleteness(records: AnalyticsRecord[]) {
  return FIELD_GROUP_ORDER.map((label) => getFieldGroupCompleteness(records, label));
}

export function getRecordsNeedingFollowUp(records: AnalyticsRecord[]) {
  return records.filter(
    (record) =>
      record.reviewStatus === "Under Review" ||
      !isMinimumDatasetComplete(record) ||
      !record.hasVerifiedCauseFindings ||
      !record.hasLinkedEvidence,
  );
}

export function getPossibleDuplicateRecords(records: AnalyticsRecord[]) {
  const seen = new Map<string, AnalyticsRecord[]>();
  records.forEach((record) => {
    const dateKey = record.incidentDateTime.slice(0, 10);
    const duplicateKey = [
      normalizeWhitespace(record.vesselName).toLowerCase(),
      record.incidentType.toLowerCase(),
      dateKey,
      record.province.toLowerCase(),
    ].join("|");

    const group = seen.get(duplicateKey) ?? [];
    group.push(record);
    seen.set(duplicateKey, group);
  });

  return Array.from(seen.values())
    .filter((group) => group.length > 1)
    .flat();
}

export function getEvidenceStrengthSummary(records: AnalyticsRecord[]): EvidenceStrengthSummary {
  const minimumDataset = getMinimumDatasetCompleteness(records);
  return {
    sampleSize: records.length,
    requiredFieldCompletenessPct: minimumDataset.percentage,
    geocodedRecords: records.filter((record) => record.hasCoordinates).length,
    verifiedCauseRecords: records.filter((record) => record.hasVerifiedCauseFindings).length,
    linkedEvidenceRecords: records.filter((record) => record.hasLinkedEvidence).length,
    weatherContextRecords: records.filter((record) => record.hasWeatherContext).length,
    possibleDuplicateRecords: getPossibleDuplicateRecords(records).length,
  };
}
