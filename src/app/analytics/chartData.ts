import { FIELD_GROUP_ORDER, REVIEW_STATUS_ORDER, SEVERITY_ORDER, WEATHER_CATEGORY_ORDER } from "./constants.ts";
import { getFieldGroupCompleteness, getMinimumDatasetCompleteness, getRecordsNeedingFollowUp, isMinimumDatasetComplete } from "./dataQuality.ts";
import type { AnalyticsRecord } from "./types.ts";

function sortByMonth<T extends { incidentMonthKey: string }>(rows: T[]) {
  return [...rows].sort((left, right) => left.incidentMonthKey.localeCompare(right.incidentMonthKey));
}

function toPercentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function buildMatrixRowMap<RowKey extends string, ColumnKey extends string>(
  rowLabels: RowKey[],
  columnLabels: ColumnKey[],
) {
  return rowLabels.map((rowLabel) => ({
    label: rowLabel,
    cells: columnLabels.map((columnLabel) => ({
      key: columnLabel,
      value: 0,
      text: "0",
    })),
  }));
}

export function buildKpiSummary(records: AnalyticsRecord[]) {
  const fatalities = records.reduce((sum, record) => sum + record.fatalitiesCount, 0);
  const injuries = records.reduce((sum, record) => sum + record.injuriesCount, 0);
  const verySerious = records.filter((record) => record.severityLevel === "Very Serious").length;
  const linkedEvidence = records.filter((record) => record.hasLinkedEvidence).length;
  const minimumDataset = getMinimumDatasetCompleteness(records);
  const followUp = getRecordsNeedingFollowUp(records).length;

  return {
    totalRecords: records.length,
    fatalities,
    injuries,
    totalCasualties: fatalities + injuries,
    verySerious,
    linkedEvidence,
    linkedEvidencePct: toPercentage(linkedEvidence, records.length),
    minimumDataset,
    followUp,
  };
}

export function buildMonthlyTrendData(records: AnalyticsRecord[]) {
  return Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.incidentMonthKey) ?? {
        incidentMonthKey: record.incidentMonthKey,
        period: record.incidentMonthLabel,
        incidents: 0,
        fatalities: 0,
        injuries: 0,
        totalCasualties: 0,
        verySerious: 0,
      };

      current.incidents += 1;
      current.fatalities += record.fatalitiesCount;
      current.injuries += record.injuriesCount;
      current.totalCasualties += record.totalCasualties;
      current.verySerious += record.severityLevel === "Very Serious" ? 1 : 0;
      map.set(record.incidentMonthKey, current);
      return map;
    }, new Map<string, {
      incidentMonthKey: string;
      period: string;
      incidents: number;
      fatalities: number;
      injuries: number;
      totalCasualties: number;
      verySerious: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => left.incidentMonthKey.localeCompare(right.incidentMonthKey));
}

export function buildIncidentTypePareto(records: AnalyticsRecord[]) {
  const totals = Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.incidentType) ?? {
        incidentType: record.incidentType,
        records: 0,
        totalCasualties: 0,
        verySerious: 0,
      };
      current.records += 1;
      current.totalCasualties += record.totalCasualties;
      current.verySerious += record.severityLevel === "Very Serious" ? 1 : 0;
      map.set(record.incidentType, current);
      return map;
    }, new Map<string, {
      incidentType: string;
      records: number;
      totalCasualties: number;
      verySerious: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.records - left.records);

  let running = 0;
  const totalRecords = records.length;
  return totals.map((row) => {
    running += row.records;
    return {
      ...row,
      cumulativePct: toPercentage(running, totalRecords),
    };
  });
}

export function buildTypeSeverityHeatmap(records: AnalyticsRecord[], metric: "records" | "casualties" = "records") {
  const rowLabels = Array.from(new Set(records.map((record) => record.incidentType))).sort((left, right) => left.localeCompare(right));
  const rows = buildMatrixRowMap(rowLabels, [...SEVERITY_ORDER].filter((label) => label !== "Unknown"));

  records.forEach((record) => {
    const row = rows.find((entry) => entry.label === record.incidentType);
    const cell = row?.cells.find((entry) => entry.key === record.severityLevel);
    if (cell) {
      cell.value += metric === "records" ? 1 : record.totalCasualties;
      cell.text = String(cell.value);
    }
  });

  return rows;
}

export function buildProvinceBurden(records: AnalyticsRecord[], metric: "records" | "casualties" | "verySerious" = "records") {
  return Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.province) ?? {
        label: record.province,
        records: 0,
        totalCasualties: 0,
        verySerious: 0,
      };
      current.records += 1;
      current.totalCasualties += record.totalCasualties;
      current.verySerious += record.severityLevel === "Very Serious" ? 1 : 0;
      map.set(record.province, current);
      return map;
    }, new Map<string, {
      label: string;
      records: number;
      totalCasualties: number;
      verySerious: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => (right[metric] as number) - (left[metric] as number));
}

export function buildPortBurden(records: AnalyticsRecord[], metric: "records" | "casualties" | "verySerious" = "records") {
  return Array.from(
    records.reduce((map, record) => {
      const key = `${record.nearestPort}__${record.province}`;
      const current = map.get(key) ?? {
        label: record.nearestPort,
        province: record.province,
        records: 0,
        totalCasualties: 0,
        verySerious: 0,
      };
      current.records += 1;
      current.totalCasualties += record.totalCasualties;
      current.verySerious += record.severityLevel === "Very Serious" ? 1 : 0;
      map.set(key, current);
      return map;
    }, new Map<string, {
      label: string;
      province: string;
      records: number;
      totalCasualties: number;
      verySerious: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => (right[metric] as number) - (left[metric] as number));
}

export function buildRouteBurden(records: AnalyticsRecord[]) {
  return Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.routeLabel) ?? {
        routeLabel: record.routeLabel,
        records: 0,
        totalCasualties: 0,
        verySerious: 0,
        completeRouteDetails: 0,
      };
      current.records += 1;
      current.totalCasualties += record.totalCasualties;
      current.verySerious += record.severityLevel === "Very Serious" ? 1 : 0;
      current.completeRouteDetails += record.routeLabel !== "Unknown / incomplete" ? 1 : 0;
      map.set(record.routeLabel, current);
      return map;
    }, new Map<string, {
      routeLabel: string;
      records: number;
      totalCasualties: number;
      verySerious: number;
      completeRouteDetails: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.records - left.records);
}

export function buildVesselTypeIncidentChart(records: AnalyticsRecord[]) {
  const incidentTypes = Array.from(new Set(records.map((record) => record.incidentType))).sort((left, right) => left.localeCompare(right));
  return Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.vesselTypeClass) ?? { vesselType: record.vesselTypeClass };
      current[record.incidentType] = ((current[record.incidentType] as number | undefined) ?? 0) + 1;
      current.total = ((current.total as number | undefined) ?? 0) + 1;
      map.set(record.vesselTypeClass, current);
      return map;
    }, new Map<string, Record<string, string | number>>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => Number(right.total) - Number(left.total));
}

export function buildVesselAgeSeverityChart(records: AnalyticsRecord[]) {
  return [...SEVERITY_ORDER]
    .filter((label) => label !== "Unknown");
}

export function buildVesselAgeSeverityRows(records: AnalyticsRecord[]) {
  return Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.vesselAgeBand) ?? {
        ageBand: record.vesselAgeBand,
        "Very Serious": 0,
        Serious: 0,
        "Less Serious": 0,
        "Near Miss": 0,
        total: 0,
      };
      current[record.severityLevel] = ((current[record.severityLevel] as number | undefined) ?? 0) + 1;
      current.total += 1;
      map.set(record.vesselAgeBand, current);
      return map;
    }, new Map<string, {
      ageBand: string;
      "Very Serious": number;
      Serious: number;
      "Less Serious": number;
      "Near Miss": number;
      total: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => {
      const order = ["0-5", "6-10", "11-20", "21-30", "31+", "Unknown"];
      return order.indexOf(left.ageBand) - order.indexOf(right.ageBand);
    });
}

export function buildWeatherSeverityHeatmap(records: AnalyticsRecord[]) {
  const rows = buildMatrixRowMap([...WEATHER_CATEGORY_ORDER], [...SEVERITY_ORDER].filter((label) => label !== "Unknown"));
  records.forEach((record) => {
    const row = rows.find((entry) => entry.label === record.weatherConditionCategory);
    const cell = row?.cells.find((entry) => entry.key === record.severityLevel);
    if (cell) {
      cell.value += 1;
      cell.text = String(cell.value);
    }
  });
  return rows;
}

export function buildCausePareto(records: AnalyticsRecord[]) {
  const totals = Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.causeCategory) ?? {
        causeCategory: record.causeCategory,
        records: 0,
        totalCasualties: 0,
        verySerious: 0,
      };
      current.records += 1;
      current.totalCasualties += record.totalCasualties;
      current.verySerious += record.severityLevel === "Very Serious" ? 1 : 0;
      map.set(record.causeCategory, current);
      return map;
    }, new Map<string, {
      causeCategory: string;
      records: number;
      totalCasualties: number;
      verySerious: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.records - left.records);

  let running = 0;
  return totals.map((row) => {
    running += row.records;
    return {
      ...row,
      cumulativePct: toPercentage(running, records.length),
    };
  });
}

export function buildCauseTypeHeatmap(records: AnalyticsRecord[], metric: "records" | "casualties" = "records") {
  const rowLabels = Array.from(new Set(records.map((record) => record.causeCategory))).sort((left, right) => left.localeCompare(right));
  const columnLabels = Array.from(new Set(records.map((record) => record.incidentType))).sort((left, right) => left.localeCompare(right));
  const rows = buildMatrixRowMap(rowLabels, columnLabels);

  records.forEach((record) => {
    const row = rows.find((entry) => entry.label === record.causeCategory);
    const cell = row?.cells.find((entry) => entry.key === record.incidentType);
    if (cell) {
      cell.value += metric === "records" ? 1 : record.totalCasualties;
      cell.text = String(cell.value);
    }
  });

  return rows;
}

export function buildDataCompletenessHeatmap(records: AnalyticsRecord[]) {
  const authorities = Array.from(new Set(records.map((record) => record.reportingAuthority))).sort((left, right) => left.localeCompare(right));
  return FIELD_GROUP_ORDER.map((label) => ({
    label,
    cells: authorities.map((authority) => {
      const authorityRecords = records.filter((record) => record.reportingAuthority === authority);
      const metric = getFieldGroupCompleteness(authorityRecords, label);
      return {
        key: authority,
        value: metric.completePct,
        text: `${metric.completePct}%`,
      };
    }),
  }));
}

export function buildReviewPipeline(records: AnalyticsRecord[]) {
  const counts = REVIEW_STATUS_ORDER.map((status) => ({
    status,
    count: records.filter((record) => record.reviewStatus === status).length,
    percentage: toPercentage(records.filter((record) => record.reviewStatus === status).length, records.length),
  })).filter((entry) => entry.count > 0);

  return counts;
}

export function buildReportingChannelQuality(records: AnalyticsRecord[]) {
  const channels = Array.from(new Set(records.map((record) => record.methodOfReporting))).sort((left, right) => left.localeCompare(right));
  return channels.map((channel) => {
    const subset = records.filter((record) => record.methodOfReporting === channel);
    const minimumDatasetPct = toPercentage(subset.filter(isMinimumDatasetComplete).length, subset.length);
    const linkedEvidencePct = toPercentage(subset.filter((record) => record.hasLinkedEvidence).length, subset.length);
    const coordinatePct = toPercentage(subset.filter((record) => record.hasCoordinates).length, subset.length);
    const verifiedCausePct = toPercentage(subset.filter((record) => record.hasVerifiedCauseFindings).length, subset.length);

    return {
      channel,
      records: subset.length,
      minimumDatasetPct,
      linkedEvidencePct,
      coordinatePct,
      verifiedCausePct,
    };
  });
}
