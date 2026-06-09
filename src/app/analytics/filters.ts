import { buildOptions } from "../components/MultiSelectFilter.tsx";
import { CAUSE_CATEGORY_ORDER, LINKED_EVIDENCE_STATUS_ORDER, REVIEW_STATUS_ORDER, SEVERITY_ORDER, VESSEL_AGE_BANDS, WEATHER_CATEGORY_ORDER } from "./constants.ts";
import type { ActiveFilters, AnalyticsRecord, FilterOptions } from "./types.ts";

export function getFilterOptions(records: AnalyticsRecord[]): FilterOptions {
  return {
    years: Array.from(new Set(records.map((record) => String(record.incidentYear)))).sort(),
    incidentTypes: buildOptions(records.map((record) => record.incidentType)),
    severities: buildOptions(records.map((record) => record.severityLevel), [...SEVERITY_ORDER]),
    provinces: buildOptions(records.map((record) => record.province)),
    vesselTypes: buildOptions(records.map((record) => record.vesselTypeClass)),
    reportingChannels: buildOptions(records.map((record) => record.methodOfReporting)),
    authorities: buildOptions(records.map((record) => record.reportingAuthority)),
    reviewStatuses: buildOptions(records.map((record) => record.reviewStatus), [...REVIEW_STATUS_ORDER]),
    routeLabels: buildOptions(records.map((record) => record.routeLabel)),
    causeCategories: buildOptions(records.map((record) => record.causeCategory), [...CAUSE_CATEGORY_ORDER]),
    weatherCategories: buildOptions(records.map((record) => record.weatherConditionCategory), [...WEATHER_CATEGORY_ORDER]),
    vesselAgeBands: buildOptions(records.map((record) => record.vesselAgeBand), [...VESSEL_AGE_BANDS]),
    linkedEvidenceStatuses: buildOptions(records.map((record) => record.linkedEvidenceStatus), [...LINKED_EVIDENCE_STATUS_ORDER]),
  };
}

export function createDefaultFilters(options: FilterOptions): ActiveFilters {
  return {
    year: "all",
    quarter: "all",
    incidentTypes: options.incidentTypes,
    severities: options.severities,
    provinces: options.provinces,
    vesselTypes: options.vesselTypes,
    reportingChannels: options.reportingChannels,
    authorities: options.authorities,
    reviewStatuses: options.reviewStatuses,
    routeLabels: options.routeLabels,
    causeCategories: options.causeCategories,
    weatherCategories: options.weatherCategories,
    vesselAgeBands: options.vesselAgeBands,
    linkedEvidenceStatuses: options.linkedEvidenceStatuses,
  };
}

export function filterRecords(records: AnalyticsRecord[], filters: ActiveFilters) {
  return records.filter((record) => {
    return (
      (filters.year === "all" || String(record.incidentYear) === filters.year) &&
      (filters.quarter === "all" || record.incidentQuarter === filters.quarter) &&
      filters.incidentTypes.includes(record.incidentType) &&
      filters.severities.includes(record.severityLevel) &&
      filters.provinces.includes(record.province) &&
      filters.vesselTypes.includes(record.vesselTypeClass) &&
      filters.reportingChannels.includes(record.methodOfReporting) &&
      filters.authorities.includes(record.reportingAuthority) &&
      filters.reviewStatuses.includes(record.reviewStatus) &&
      filters.routeLabels.includes(record.routeLabel) &&
      filters.causeCategories.includes(record.causeCategory) &&
      filters.weatherCategories.includes(record.weatherConditionCategory) &&
      filters.vesselAgeBands.includes(record.vesselAgeBand) &&
      filters.linkedEvidenceStatuses.includes(record.linkedEvidenceStatus)
    );
  });
}

export function summarizeFilterSelection(filters: ActiveFilters) {
  const parts = [
    filters.year === "all" ? "All years" : filters.year,
    filters.quarter === "all" ? "All quarters" : filters.quarter,
    `${filters.incidentTypes.length} incident types`,
    `${filters.severities.length} severities`,
    `${filters.provinces.length} provinces`,
    `${filters.vesselTypes.length} vessel types`,
    `${filters.reportingChannels.length} channels`,
    `${filters.authorities.length} authorities`,
    `${filters.reviewStatuses.length} statuses`,
    `${filters.routeLabels.length} routes`,
    `${filters.causeCategories.length} cause categories`,
    `${filters.weatherCategories.length} weather groups`,
    `${filters.vesselAgeBands.length} age bands`,
    `${filters.linkedEvidenceStatuses.length} evidence groups`,
  ];

  return parts.join(" · ");
}
