import { ANALYTICS_CAVEAT } from "./constants.ts";
import { getAllFieldGroupCompleteness, getEvidenceStrengthSummary, getFieldGroupCompleteness, getMinimumDatasetCompleteness } from "./dataQuality.ts";
import type { ActiveFilters, AnalyticsRecord, ConfidenceInput, PolicyPriorityItem } from "./types.ts";

function toPercentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function buildTopCount<T extends string>(records: AnalyticsRecord[], getKey: (record: AnalyticsRecord) => T) {
  const counts = new Map<T, number>();
  records.forEach((record) => {
    const key = getKey(record);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const ranked = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);

  return ranked[0];
}

function buildTopCasualtyType(records: AnalyticsRecord[]) {
  const totals = new Map<string, number>();
  records.forEach((record) => {
    totals.set(record.incidentType, (totals.get(record.incidentType) ?? 0) + record.totalCasualties);
  });

  return Array.from(totals.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)[0];
}

export function getConfidenceLabel(input: ConfidenceInput) {
  const { sampleSize, requiredFieldCompletenessPct, relevantFieldCompletenessPct, hasEvidenceSupport } = input;

  if (
    sampleSize >= 30 &&
    requiredFieldCompletenessPct >= 80 &&
    relevantFieldCompletenessPct >= 80 &&
    hasEvidenceSupport
  ) {
    return "High" as const;
  }

  if (
    sampleSize >= 10 &&
    requiredFieldCompletenessPct >= 60 &&
    relevantFieldCompletenessPct >= 60
  ) {
    return "Medium" as const;
  }

  return "Low" as const;
}

export function buildPolicyPriorityItems(records: AnalyticsRecord[], _filters: ActiveFilters): PolicyPriorityItem[] {
  if (!records.length) {
    return [];
  }

  const items: PolicyPriorityItem[] = [];
  const minimumDataset = getMinimumDatasetCompleteness(records);
  const evidenceStrength = getEvidenceStrengthSummary(records);
  const routeCompleteness = getFieldGroupCompleteness(records, "Voyage / route");
  const investigationCompleteness = getFieldGroupCompleteness(records, "Cause and investigation");
  const evidenceCompleteness = getFieldGroupCompleteness(records, "Linked evidence");
  const vesselRegistryCompleteness = getFieldGroupCompleteness(records, "Vessel registry");

  const topIncidentType = buildTopCount(records, (record) => record.incidentType);
  if (topIncidentType) {
    items.push({
      id: "leading-incident-type",
      reviewArea: `${topIncidentType.label} review`,
      evidenceSignal: `${topIncidentType.label} is the most reported incident type in the current selection (${topIncidentType.count} records, ${toPercentage(topIncidentType.count, records.length)}% of records).`,
      supportingFigureId: "incident-type-pareto",
      supportingMetric: `${topIncidentType.count} records`,
      recommendedFollowUp: "Review narratives, cause findings, vessel classes, and route context for recurring control failures.",
      responsibleUnit: "MARINA / review team",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: 100,
        hasEvidenceSupport: true,
      }),
      dataLimitation: ANALYTICS_CAVEAT,
      includeInExport: true,
    });
  }

  const highestCasualtyType = buildTopCasualtyType(records);
  if (highestCasualtyType && highestCasualtyType.count > 0) {
    items.push({
      id: "high-casualty-burden",
      reviewArea: "High casualty burden",
      evidenceSignal: `${highestCasualtyType.label} accounts for the highest reported fatalities and injuries in the current selection (${highestCasualtyType.count}).`,
      supportingFigureId: "monthly-incident-burden",
      supportingMetric: `${highestCasualtyType.count} fatalities/injuries`,
      recommendedFollowUp: "Prioritize case review and safety measures for this incident type.",
      responsibleUnit: "MARINA / PCG",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: 100,
        hasEvidenceSupport: true,
      }),
      dataLimitation: "Fatalities and injuries are based on submitted records only.",
      includeInExport: true,
    });
  }

  const topProvince = buildTopCount(records, (record) => record.province);
  if (topProvince) {
    items.push({
      id: "location-concentration",
      reviewArea: "Reported location concentration",
      evidenceSignal: `${topProvince.label} has the highest reported incident burden in the current selection (${topProvince.count} records).`,
      supportingFigureId: "province-burden",
      supportingMetric: `${topProvince.count} records`,
      recommendedFollowUp: "Validate whether the concentration reflects actual operations, reporting coverage, or repeated safety issues.",
      responsibleUnit: "MARINA / PCG / PPA",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: evidenceStrength.sampleSize ? Math.round((evidenceStrength.geocodedRecords / evidenceStrength.sampleSize) * 100) : 0,
        hasEvidenceSupport: evidenceStrength.geocodedRecords > 0,
      }),
      dataLimitation: "Reported burden only. Not normalized by port calls, passenger traffic, or vessel movements.",
      includeInExport: true,
    });
  }

  const topRoute = buildTopCount(records.filter((record) => record.routeLabel !== "Unknown / incomplete"), (record) => record.routeLabel);
  if (topRoute && topRoute.count >= 2) {
    items.push({
      id: "route-review",
      reviewArea: "Route/corridor review",
      evidenceSignal: `${topRoute.label} appears in ${topRoute.count} submitted records in the current selection.`,
      supportingFigureId: "route-burden",
      supportingMetric: `${topRoute.count} records`,
      recommendedFollowUp: "Compare with voyage volume and inspect route narratives before making route-level policy claims.",
      responsibleUnit: "MARINA / route review team",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: routeCompleteness.completePct,
        hasEvidenceSupport: topRoute.count > 0,
      }),
      dataLimitation: "No voyage or AIS denominator is currently integrated.",
      includeInExport: true,
    });
  }

  const weakestGroup = getAllFieldGroupCompleteness(records)
    .sort((left, right) => left.completePct - right.completePct)[0];
  if (weakestGroup) {
    items.push({
      id: "data-standardization",
      reviewArea: "Data collection and reporting standardization",
      evidenceSignal: `${weakestGroup.label} completeness is ${weakestGroup.completePct}% in the current selection.`,
      supportingFigureId: "data-completeness",
      supportingMetric: `${weakestGroup.completePct}% complete`,
      recommendedFollowUp: "Revise the reporting form, circular, or training material to improve this field group.",
      responsibleUnit: "Internal review team",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: weakestGroup.completePct,
        hasEvidenceSupport: true,
      }),
      dataLimitation: "Completeness is measured directly from submitted records and does not assess factual accuracy.",
      includeInExport: true,
    });
  }

  const seriousWeatherRecords = records.filter(
    (record) =>
      (record.severityLevel === "Serious" || record.severityLevel === "Very Serious") &&
      record.weatherConditionCategory !== "Good conditions" &&
      record.weatherConditionCategory !== "Unknown",
  );
  if (seriousWeatherRecords.length) {
    items.push({
      id: "weather-operations",
      reviewArea: "Weather and sea-state operations",
      evidenceSignal: `${seriousWeatherRecords.length} serious or very serious records include moderate or adverse weather/sea condition context.`,
      supportingFigureId: "weather-analysis",
      supportingMetric: `${seriousWeatherRecords.length} serious/very serious records`,
      recommendedFollowUp: "Review whether pre-departure weather threshold guidance and reporting fields are adequate.",
      responsibleUnit: "MARINA / PCG",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: evidenceStrength.sampleSize ? Math.round((evidenceStrength.weatherContextRecords / evidenceStrength.sampleSize) * 100) : 0,
        hasEvidenceSupport: evidenceStrength.weatherContextRecords > 0,
      }),
      dataLimitation: "Weather presence in the record does not prove causation.",
      includeInExport: true,
    });
  }

  if (vesselRegistryCompleteness.completePct < 90) {
    items.push({
      id: "registry-completeness",
      reviewArea: "Vessel inspection and registry completeness",
      evidenceSignal: `Vessel registry completeness is ${vesselRegistryCompleteness.completePct}% in the current selection.`,
      supportingFigureId: "channel-quality",
      supportingMetric: `${vesselRegistryCompleteness.completePct}% complete`,
      recommendedFollowUp: "Strengthen identifier capture for vessel registry, flag state, and classification review.",
      responsibleUnit: "MARINA",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: vesselRegistryCompleteness.completePct,
        hasEvidenceSupport: true,
      }),
      dataLimitation: "This finding reflects reporting completeness, not fleet-wide registry quality.",
      includeInExport: true,
    });
  }

  if (investigationCompleteness.completePct < 90 || evidenceCompleteness.completePct < 90) {
    items.push({
      id: "evidence-readiness",
      reviewArea: "Evidence management and investigation readiness",
      evidenceSignal: `Cause and investigation completeness is ${investigationCompleteness.completePct}% and linked evidence completeness is ${evidenceCompleteness.completePct}% in the current selection.`,
      supportingFigureId: "channel-quality",
      supportingMetric: `${investigationCompleteness.completePct}% investigation completeness / ${evidenceCompleteness.completePct}% linked evidence`,
      recommendedFollowUp: "Prioritize records missing cause findings or linked documents before drafting formal policy outputs.",
      responsibleUnit: "Investigation review team",
      confidence: getConfidenceLabel({
        sampleSize: records.length,
        requiredFieldCompletenessPct: minimumDataset.percentage,
        relevantFieldCompletenessPct: Math.min(investigationCompleteness.completePct, evidenceCompleteness.completePct),
        hasEvidenceSupport: true,
      }),
      dataLimitation: "Records may still be operationally useful even when evidence packets are incomplete.",
      includeInExport: true,
    });
  }

  return items;
}
