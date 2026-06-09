import { Incident, mockIncidents } from "./mockIncidents";

const regionByProvince: Record<string, string> = {
  "Metro Manila": "Luzon",
  Batangas: "Luzon",
  Cebu: "Visayas",
  Bohol: "Visayas",
  Albay: "Luzon",
  "Davao del Sur": "Mindanao",
  Leyte: "Visayas",
  "Southern Leyte": "Visayas",
  Palawan: "Luzon",
  Cagayan: "Luzon",
  "Oriental Mindoro": "Luzon",
  "Misamis Oriental": "Mindanao",
  Sorsogon: "Luzon",
  Iloilo: "Visayas",
};

const fallbackCauseByType: Record<string, string> = {
  Collision: "Navigation Error",
  Grounding: "Navigation Error",
  Sinking: "Weather Conditions",
  "Fire/Explosion": "Mechanical Failure",
  Capsizing: "Weather Conditions",
  Flooding: "Mechanical Failure",
  Swamping: "Weather Conditions",
  "Machinery Failure": "Mechanical Failure",
  "Person Overboard": "Human Error",
  "Pollution Incident": "Mechanical Failure",
};

const fallbackBehaviorByCause: Record<string, string[]> = {
  "Navigation Error": ["Communication Failure", "Violation of Procedures"],
  "Mechanical Failure": ["Inadequate Training"],
  "Weather Conditions": ["Communication Failure", "Violation of Procedures"],
  "Human Error": ["Fatigue", "Violation of Procedures"],
  "Under Investigation": [],
};

const fallbackCargoByVesselType: Record<string, string> = {
  Ferry: "Passengers",
  "Fishing Vessel": "Fish Catch",
  "Container Ship": "Containers",
  "Oil Tanker": "Fuel / Oil",
  "Bulk Carrier": "Bulk Cargo",
  "General Cargo": "General Cargo",
  "Passenger Vessel": "Passengers",
};

const fallbackYearBuiltByVesselType: Record<string, number> = {
  Ferry: 2009,
  "Fishing Vessel": 2001,
  "Container Ship": 2010,
  "Oil Tanker": 2007,
  "Bulk Carrier": 2005,
  "General Cargo": 2008,
  "Passenger Vessel": 2012,
};

const severityWeights: Record<string, number> = {
  "Very Serious": 4,
  Serious: 3,
  "Less Serious": 2,
  "Near Miss": 1,
};

const severityColors: Record<string, string> = {
  "Very Serious": "#991b1b",
  Serious: "#dc2626",
  "Less Serious": "#f97316",
  "Near Miss": "#f59e0b",
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const seasonOrder = ["Northeast Monsoon", "Transition Season", "Southwest Monsoon", "Typhoon Season"];
const visibilityOrder = ["Good", "Moderate", "Poor", "Very Poor"];

function getSeason(date: Date) {
  const month = date.getMonth();
  if (month === 11 || month === 0 || month === 1) {
    return "Northeast Monsoon";
  }
  if (month >= 2 && month <= 4) {
    return "Transition Season";
  }
  if (month >= 5 && month <= 8) {
    return "Southwest Monsoon";
  }
  return "Typhoon Season";
}

function unique<T>(values: T[]) {
  return values.filter((value, index, array) => array.indexOf(value) === index);
}

function sortByCount<T extends { count: number }>(items: T[]) {
  return items.sort((left, right) => right.count - left.count);
}

function countBy<T>(rows: T[], getLabel: (row: T) => string) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const label = getLabel(row);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return sortByCount(
    Array.from(counts.entries()).map(([label, count]) => ({
      label,
      count,
    })),
  );
}

function sumBy<T>(rows: T[], getLabel: (row: T) => string, getValue: (row: T) => number) {
  const sums = new Map<string, number>();

  rows.forEach((row) => {
    const label = getLabel(row);
    sums.set(label, (sums.get(label) ?? 0) + getValue(row));
  });

  return sortByCount(
    Array.from(sums.entries()).map(([label, count]) => ({
      label,
      count,
    })),
  );
}

function toPercentage(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getTopLabel<T>(rows: T[], getLabel: (row: T) => string) {
  return countBy(rows, getLabel)[0]?.label ?? "Not established";
}

function getConfidenceLabel(score: number) {
  if (score >= 80) {
    return "High";
  }
  if (score >= 65) {
    return "Moderate";
  }
  return "Low";
}

function buildMonthLabel(date: Date) {
  return `${monthFormatter.format(date)} ${String(date.getFullYear()).slice(2)}`;
}

export interface EnrichedIncident extends Incident {
  region: string;
  seaAreaResolved: string;
  corridorResolved: string;
  monthLabel: string;
  monthKey: string;
  year: number;
  season: string;
  primaryCauseResolved: string;
  crewBehaviorFactorsResolved: string[];
  cargoTypeResolved: string;
  vesselAgeYears: number;
  casualtyCount: number;
  riskIndex: number;
  routeLabel: string;
  registryIdCaptured: boolean;
  voyageCaptured: boolean;
  weatherCaptured: boolean;
  standardizationScore: number;
}

export interface PolicyEvidencePacket {
  id: string;
  title: string;
  priority: "High" | "Medium";
  policyInstrument: string;
  lead: string;
  supportingRecords: number;
  fatalities: number;
  injuries: number;
  seaAreas: string[];
  corridors: string[];
  vesselTypes: string[];
  confidenceLabel: string;
  confidenceScore: number;
  evidenceSummary: string;
  confidenceNote: string;
  recommendedAction: string;
}

function enrichIncident(incident: Incident): EnrichedIncident {
  const parsedDate = new Date(incident.date);
  const year = parsedDate.getFullYear();
  const primaryCauseResolved = incident.primaryCause ?? fallbackCauseByType[incident.type] ?? "Under Investigation";
  const crewBehaviorFactorsResolved = incident.crewBehaviorFactors?.length
    ? incident.crewBehaviorFactors
    : fallbackBehaviorByCause[primaryCauseResolved] ?? [];
  const cargoTypeResolved = incident.cargoType ?? fallbackCargoByVesselType[incident.vesselType] ?? "General Cargo";
  const derivedYearBuilt = incident.yearBuilt ?? fallbackYearBuiltByVesselType[incident.vesselType] ?? 2010;
  const casualtyCount = incident.fatalities + incident.injuries;
  const registryIdCaptured = Boolean(incident.imoNumber || incident.officialNumber);
  const voyageCaptured = Boolean(incident.voyageOrigin && incident.voyageDestination);
  const weatherCaptured = Boolean(
    incident.weather?.waveHeight !== undefined &&
    incident.weather?.windForce !== undefined &&
    incident.weather?.visibility,
  );
  const fallbackRoute = [incident.voyageOrigin, incident.voyageDestination].filter(Boolean).join(" to ");
  const seaAreaResolved = incident.seaArea ?? incident.location.port;
  const corridorResolved = incident.corridor ?? incident.intendedRoute ?? (fallbackRoute || "Corridor pending");

  const standardizationChecks = [
    Boolean(incident.date),
    Boolean(incident.type),
    Boolean(incident.severity),
    Boolean(incident.location?.lat || incident.location?.lat === 0),
    Boolean(incident.location?.lng || incident.location?.lng === 0),
    Boolean(incident.location?.port),
    Boolean(incident.location?.province),
    weatherCaptured,
    Boolean(incident.vesselName),
    Boolean(incident.flagState),
    registryIdCaptured,
    voyageCaptured,
    Boolean(incident.cargoType),
    Boolean(incident.narrative),
    Boolean(incident.authority),
  ];

  return {
    ...incident,
    region: regionByProvince[incident.location.province] ?? "National",
    seaAreaResolved,
    corridorResolved,
    monthLabel: buildMonthLabel(parsedDate),
    monthKey: `${year}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`,
    year,
    season: getSeason(parsedDate),
    primaryCauseResolved,
    crewBehaviorFactorsResolved,
    cargoTypeResolved,
    vesselAgeYears: Math.max(new Date().getFullYear() - derivedYearBuilt, 0),
    casualtyCount,
    riskIndex: (severityWeights[incident.severity] ?? 1) * Math.max(casualtyCount, 1),
    routeLabel: incident.intendedRoute ?? (fallbackRoute || "Route pending"),
    registryIdCaptured,
    voyageCaptured,
    weatherCaptured,
    standardizationScore: Math.round((standardizationChecks.filter(Boolean).length / standardizationChecks.length) * 100),
  };
}

function summarizeSubset(records: EnrichedIncident[]) {
  const supportingRecords = records.length;
  const fatalities = records.reduce((sum, record) => sum + record.fatalities, 0);
  const injuries = records.reduce((sum, record) => sum + record.injuries, 0);
  const avgStandardization = Math.round(average(records.map((record) => record.standardizationScore)));
  const evidenceCoverage = toPercentage(records.filter((record) => Boolean(record.linkedDocuments?.length)).length, supportingRecords);
  const reviewCoverage = toPercentage(
    records.filter((record) => record.status === "Verified" || record.status === "Published").length,
    supportingRecords,
  );
  const confidenceScore = Math.round(avgStandardization * 0.5 + evidenceCoverage * 0.25 + reviewCoverage * 0.25);

  return {
    supportingRecords,
    fatalities,
    injuries,
    avgStandardization,
    evidenceCoverage,
    reviewCoverage,
    confidenceScore,
    confidenceLabel: getConfidenceLabel(confidenceScore),
    seaAreas: unique(records.map((record) => record.seaAreaResolved)),
    corridors: unique(records.map((record) => record.corridorResolved)),
    vesselTypes: unique(records.map((record) => record.vesselType)),
    dominantCause: getTopLabel(records, (record) => record.primaryCauseResolved),
  };
}

function buildPolicyPacket(
  id: string,
  title: string,
  priority: "High" | "Medium",
  policyInstrument: string,
  lead: string,
  records: EnrichedIncident[],
  recommendedAction: string,
): PolicyEvidencePacket {
  const summary = summarizeSubset(records);

  return {
    id,
    title,
    priority,
    policyInstrument,
    lead,
    supportingRecords: summary.supportingRecords,
    fatalities: summary.fatalities,
    injuries: summary.injuries,
    seaAreas: summary.seaAreas,
    corridors: summary.corridors,
    vesselTypes: summary.vesselTypes,
    confidenceLabel: summary.confidenceLabel,
    confidenceScore: summary.confidenceScore,
    evidenceSummary:
      `${summary.supportingRecords} supporting records, ${summary.fatalities} fatalities, ${summary.injuries} injuries, and ${summary.avgStandardization}% average record completeness.`,
    confidenceNote:
      `${summary.confidenceLabel} confidence based on ${summary.evidenceCoverage}% linked evidence coverage and ${summary.reviewCoverage}% published/verified review status.`,
    recommendedAction,
  };
}

export const incidentRecords = mockIncidents
  .map(enrichIncident)
  .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

export const analyticsSummary = {
  totalIncidents: incidentRecords.length,
  verySeriousCount: incidentRecords.filter((incident) => incident.severity === "Very Serious").length,
  highConsequenceCount: incidentRecords.filter(
    (incident) => incident.severity === "Very Serious" || incident.casualtyCount >= 3,
  ).length,
  fatalities: incidentRecords.reduce((sum, incident) => sum + incident.fatalities, 0),
  injuries: incidentRecords.reduce((sum, incident) => sum + incident.injuries, 0),
  authoritiesRepresented: unique(incidentRecords.map((incident) => incident.authority)).length,
  underReview: incidentRecords.filter((incident) => incident.status === "Under Review").length,
  registryCoverage: incidentRecords.filter((incident) => incident.registryIdCaptured).length,
  evidenceLinkedRecords: incidentRecords.filter((incident) => Boolean(incident.linkedDocuments?.length)).length,
  linkedEvidenceCoverage: toPercentage(
    incidentRecords.filter((incident) => Boolean(incident.linkedDocuments?.length)).length,
    incidentRecords.length,
  ),
  corridorsRepresented: unique(incidentRecords.map((incident) => incident.corridorResolved)).length,
  seaAreasRepresented: unique(incidentRecords.map((incident) => incident.seaAreaResolved)).length,
  averageStandardization: Math.round(
    incidentRecords.reduce((sum, incident) => sum + incident.standardizationScore, 0) / incidentRecords.length,
  ),
};

export const monthlyTrendData = Array.from(
  incidentRecords.reduce((map, incident) => {
    const current = map.get(incident.monthKey) ?? {
      period: incident.monthLabel,
      incidents: 0,
      fatalities: 0,
      injuries: 0,
      casualties: 0,
      riskIndex: 0,
      verySerious: 0,
    };

    current.incidents += 1;
    current.fatalities += incident.fatalities;
    current.injuries += incident.injuries;
    current.casualties += incident.casualtyCount;
    current.riskIndex += incident.riskIndex;
    current.verySerious += incident.severity === "Very Serious" ? 1 : 0;

    map.set(incident.monthKey, current);
    return map;
  }, new Map<string, {
    period: string;
    incidents: number;
    fatalities: number;
    injuries: number;
    casualties: number;
    riskIndex: number;
    verySerious: number;
  }>()),
)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, value]) => value);

export const monthlySeverityData = Array.from(
  incidentRecords.reduce((map, incident) => {
    const current = map.get(incident.monthKey) ?? {
      period: incident.monthLabel,
      verySerious: 0,
      serious: 0,
      lessSerious: 0,
      nearMiss: 0,
    };

    if (incident.severity === "Very Serious") {
      current.verySerious += 1;
    } else if (incident.severity === "Serious") {
      current.serious += 1;
    } else if (incident.severity === "Less Serious") {
      current.lessSerious += 1;
    } else {
      current.nearMiss += 1;
    }

    map.set(incident.monthKey, current);
    return map;
  }, new Map<string, {
    period: string;
    verySerious: number;
    serious: number;
    lessSerious: number;
    nearMiss: number;
  }>()),
)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, value]) => value);

export const severityBreakdown = countBy(incidentRecords, (incident) => incident.severity).map((entry) => {
  const matching = incidentRecords.filter((incident) => incident.severity === entry.label);
  return {
    label: entry.label,
    count: entry.count,
    percentage: toPercentage(entry.count, incidentRecords.length),
    casualties: matching.reduce((sum, incident) => sum + incident.casualtyCount, 0),
    color: severityColors[entry.label] ?? "#f59e0b",
  };
});

export const incidentTypeBreakdown = countBy(incidentRecords, (incident) => incident.type).map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.type === entry.label);
  return {
    type: entry.label,
    count: entry.count,
    fatalities: incidents.reduce((sum, incident) => sum + incident.fatalities, 0),
    injuries: incidents.reduce((sum, incident) => sum + incident.injuries, 0),
    percentage: toPercentage(entry.count, incidentRecords.length),
  };
});

export const provinceBreakdown = countBy(incidentRecords, (incident) => incident.location.province).map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.location.province === entry.label);
  return {
    province: entry.label,
    incidents: entry.count,
    fatalities: incidents.reduce((sum, incident) => sum + incident.fatalities, 0),
    injuries: incidents.reduce((sum, incident) => sum + incident.injuries, 0),
    region: incidents[0]?.region ?? "National",
  };
});

export const provinceHotspots = sumBy(
  incidentRecords,
  (incident) => incident.location.province,
  (incident) => incident.riskIndex,
).map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.location.province === entry.label);
  return {
    province: entry.label,
    riskIndex: entry.count,
    incidents: incidents.length,
    fatalities: incidents.reduce((sum, incident) => sum + incident.fatalities, 0),
    injuries: incidents.reduce((sum, incident) => sum + incident.injuries, 0),
    region: incidents[0]?.region ?? "National",
  };
});

export const corridorHotspots = sumBy(
  incidentRecords,
  (incident) => incident.corridorResolved,
  (incident) => incident.riskIndex,
).map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.corridorResolved === entry.label);
  return {
    corridor: entry.label,
    seaArea: incidents[0]?.seaAreaResolved ?? "Unspecified waters",
    incidents: incidents.length,
    fatalities: incidents.reduce((sum, incident) => sum + incident.fatalities, 0),
    injuries: incidents.reduce((sum, incident) => sum + incident.injuries, 0),
    riskIndex: entry.count,
    verySerious: incidents.filter((incident) => incident.severity === "Very Serious").length,
    dominantCause: getTopLabel(incidents, (incident) => incident.primaryCauseResolved),
    averageStandardization: Math.round(average(incidents.map((incident) => incident.standardizationScore))),
  };
});

export const seaAreaBreakdown = sumBy(
  incidentRecords,
  (incident) => incident.seaAreaResolved,
  (incident) => incident.riskIndex,
).map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.seaAreaResolved === entry.label);
  return {
    seaArea: entry.label,
    incidents: incidents.length,
    fatalities: incidents.reduce((sum, incident) => sum + incident.fatalities, 0),
    injuries: incidents.reduce((sum, incident) => sum + incident.injuries, 0),
    riskIndex: entry.count,
  };
});

export const regionBreakdown = countBy(incidentRecords, (incident) => incident.region).map((entry) => ({
  region: entry.label,
  incidents: entry.count,
}));

export const vesselTypeBreakdown = countBy(incidentRecords, (incident) => incident.vesselType).map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.vesselType === entry.label);
  return {
    type: entry.label,
    count: entry.count,
    percentage: toPercentage(entry.count, incidentRecords.length),
    riskIndex: incidents.reduce((sum, incident) => sum + incident.riskIndex, 0),
    casualties: incidents.reduce((sum, incident) => sum + incident.casualtyCount, 0),
    verySerious: incidents.filter((incident) => incident.severity === "Very Serious").length,
  };
});

export const vesselExposureData = vesselTypeBreakdown
  .map((entry) => ({
    ...entry,
    severityIndex: Math.round(entry.riskIndex / Math.max(entry.count, 1)),
  }))
  .sort((left, right) => right.riskIndex - left.riskIndex);

export const authorityBreakdown = countBy(incidentRecords, (incident) => incident.authority).map((entry) => ({
  authority: entry.label,
  count: entry.count,
  percentage: toPercentage(entry.count, incidentRecords.length),
}));

export const statusBreakdown = countBy(incidentRecords, (incident) => incident.status).map((entry) => ({
  status: entry.label,
  count: entry.count,
  percentage: toPercentage(entry.count, incidentRecords.length),
}));

export const statusCompletenessData = statusBreakdown.map((entry) => {
  const incidents = incidentRecords.filter((incident) => incident.status === entry.status);
  return {
    status: entry.status,
    count: entry.count,
    averageStandardization: Math.round(average(incidents.map((incident) => incident.standardizationScore))),
  };
});

export const visibilityCorrelation = sumBy(
  incidentRecords,
  (incident) => incident.weather.visibility,
  (incident) => incident.riskIndex,
).map((entry) => {
  const related = incidentRecords.filter((incident) => incident.weather.visibility === entry.label);
  return {
    visibility: entry.label,
    riskIndex: entry.count,
    incidents: related.length,
    fatalities: related.reduce((sum, incident) => sum + incident.fatalities, 0),
    injuries: related.reduce((sum, incident) => sum + incident.injuries, 0),
  };
});

export const causeBreakdown = countBy(incidentRecords, (incident) => incident.primaryCauseResolved).map((entry) => {
  const related = incidentRecords.filter((incident) => incident.primaryCauseResolved === entry.label);
  return {
    cause: entry.label,
    incidents: entry.count,
    casualties: related.reduce((sum, incident) => sum + incident.casualtyCount, 0),
    fatalities: related.reduce((sum, incident) => sum + incident.fatalities, 0),
    corridorsAffected: unique(related.map((incident) => incident.corridorResolved)).length,
  };
});

export const causeParetoData = causeBreakdown
  .sort((left, right) => right.incidents - left.incidents)
  .reduce<Array<{
    cause: string;
    incidents: number;
    casualties: number;
    fatalities: number;
    corridorsAffected: number;
    cumulativePercentage: number;
  }>>((rows, current) => {
    const runningTotal = rows.length ? rows[rows.length - 1].cumulativePercentage : 0;
    rows.push({
      ...current,
      cumulativePercentage: runningTotal + toPercentage(current.incidents, incidentRecords.length),
    });
    return rows;
  }, []);

export const behaviorFactorBreakdown = countBy(
  incidentRecords.flatMap((incident) => incident.crewBehaviorFactorsResolved.map((factor) => ({ factor }))),
  (entry) => entry.factor,
).map((entry) => ({
  factor: entry.label,
  count: entry.count,
  percentage: toPercentage(entry.count, Math.max(incidentRecords.length, 1)),
}));

export const casualtiesByType = Array.from(
  incidentRecords.reduce((map, incident) => {
    const current = map.get(incident.type) ?? {
      type: incident.type,
      incidents: 0,
      fatalities: 0,
      injuries: 0,
      casualties: 0,
    };

    current.incidents += 1;
    current.fatalities += incident.fatalities;
    current.injuries += incident.injuries;
    current.casualties += incident.casualtyCount;
    map.set(incident.type, current);
    return map;
  }, new Map<string, {
    type: string;
    incidents: number;
    fatalities: number;
    injuries: number;
    casualties: number;
  }>()),
)
  .map(([, value]) => value)
  .sort((left, right) => right.casualties - left.casualties);

export const seasonBreakdown = Array.from(
  incidentRecords.reduce((map, incident) => {
    const current = map.get(incident.season) ?? {
      season: incident.season,
      incidents: 0,
      riskIndex: 0,
      fatalities: 0,
      injuries: 0,
      casualties: 0,
    };

    current.incidents += 1;
    current.riskIndex += incident.riskIndex;
    current.fatalities += incident.fatalities;
    current.injuries += incident.injuries;
    current.casualties += incident.casualtyCount;
    map.set(incident.season, current);
    return map;
  }, new Map<string, {
    season: string;
    incidents: number;
    riskIndex: number;
    fatalities: number;
    injuries: number;
    casualties: number;
  }>()),
)
  .map(([, value]) => value)
  .sort((left, right) => seasonOrder.indexOf(left.season) - seasonOrder.indexOf(right.season));

export const seasonVisibilityMatrix = seasonOrder.map((season) => {
  const cells = visibilityOrder.map((visibility) => {
    const subset = incidentRecords.filter(
      (incident) => incident.season === season && incident.weather.visibility === visibility,
    );
    return {
      visibility,
      incidents: subset.length,
      riskIndex: subset.reduce((sum, incident) => sum + incident.riskIndex, 0),
      fatalities: subset.reduce((sum, incident) => sum + incident.fatalities, 0),
    };
  });

  return {
    season,
    cells,
  };
});

export const seasonVisibilityPeak = Math.max(
  ...seasonVisibilityMatrix.flatMap((row) => row.cells.map((cell) => cell.riskIndex)),
  1,
);

export const ageScatterData = incidentRecords.map((incident) => ({
  vesselName: incident.vesselName,
  age: incident.vesselAgeYears,
  casualties: incident.casualtyCount,
  severity: incident.severity,
  vesselType: incident.vesselType,
  province: incident.location.province,
}));

export const reportingMethodBreakdown = countBy(
  incidentRecords.map((incident) => ({ method: incident.reportingMethod ?? "Unspecified" })),
  (entry) => entry.method,
).map((entry) => ({
  method: entry.label,
  count: entry.count,
}));

export const dataCompleteness = [
  {
    label: "Registry identifiers",
    description: "IMO number or official number captured",
    captured: incidentRecords.filter((incident) => incident.registryIdCaptured).length,
  },
  {
    label: "Voyage and route details",
    description: "Origin, destination, and route context documented",
    captured: incidentRecords.filter(
      (incident) => incident.voyageCaptured && Boolean(incident.routeLabel && incident.routeLabel !== "Route pending"),
    ).length,
  },
  {
    label: "Weather observations",
    description: "Wave height, wind force, and visibility present",
    captured: incidentRecords.filter((incident) => incident.weatherCaptured).length,
  },
  {
    label: "Cause findings",
    description: "Primary cause and findings documented",
    captured: incidentRecords.filter((incident) => Boolean(incident.primaryCause && incident.findingsOfCause)).length,
  },
  {
    label: "Linked evidence",
    description: "Attachments or supporting documents referenced",
    captured: incidentRecords.filter((incident) => Boolean(incident.linkedDocuments?.length)).length,
  },
  {
    label: "Ownership and operator",
    description: "Accountable entity information available",
    captured: incidentRecords.filter((incident) => Boolean(incident.ownerName || incident.operatorName)).length,
  },
].map((entry) => ({
  ...entry,
  total: incidentRecords.length,
  percentage: toPercentage(entry.captured, incidentRecords.length),
}));

export const criticalGapData = [...dataCompleteness].sort((left, right) => left.percentage - right.percentage);

export const corridorInvestigationTable = corridorHotspots.slice(0, 6).map((entry) => ({
  corridor: entry.corridor,
  seaArea: entry.seaArea,
  incidents: entry.incidents,
  fatalities: entry.fatalities,
  injuries: entry.injuries,
  riskIndex: entry.riskIndex,
  dominantCause: entry.dominantCause,
  averageStandardization: entry.averageStandardization,
}));

const topCorridor = corridorHotspots[0]?.corridor;
const weatherFishingSubset = incidentRecords.filter(
  (incident) => incident.primaryCauseResolved === "Weather Conditions" && incident.vesselType === "Fishing Vessel",
);
const navigationSubset = incidentRecords.filter((incident) => incident.primaryCauseResolved === "Navigation Error");
const mechanicalSubset = incidentRecords.filter((incident) => incident.primaryCauseResolved === "Mechanical Failure");

export const policyEvidencePackets: PolicyEvidencePacket[] = [
  buildPolicyPacket(
    "corridor-management",
    `Traffic and separation controls in ${topCorridor ?? "priority corridors"}`,
    "High",
    "Corridor management circular",
    "MARINA / PCG / Port authorities",
    incidentRecords.filter((incident) => incident.corridorResolved === topCorridor),
    "Prioritize lane discipline, small-craft separation, and approach-control guidance in the highest-risk corridor.",
  ),
  buildPolicyPacket(
    "navigation-discipline",
    "Navigation-error reduction through bridge procedure enforcement",
    "High",
    "Bridge procedure advisory",
    "MARINA / PCG / Shipping operators",
    navigationSubset,
    "Target bridge communication, lookout reinforcement, and route cross-checking requirements where navigation error recurs.",
  ),
  buildPolicyPacket(
    "small-craft-weather",
    "Small-craft weather protection for fishing operations",
    "High",
    "Small-craft safety advisory",
    "PCG / BFAR / Local port authorities",
    weatherFishingSubset,
    "Strengthen go/no-go weather controls, squall advisories, and stability guidance for fishing vessels operating in exposed corridors.",
  ),
  buildPolicyPacket(
    "machinery-readiness",
    "Machinery-readiness checks on ferries, tankers, and merchant arrivals",
    "Medium",
    "Inspection and readiness memo",
    "MARINA / Port state and domestic inspection units",
    mechanicalSubset,
    "Use repeat mechanical cases to focus machinery-readiness inspections before corridor entry, berthing, or discharge operations.",
  ),
];

export const topPolicySignals = policyEvidencePackets.slice(0, 3).map((packet) => ({
  title: packet.title,
  severity: packet.priority,
  evidence: packet.evidenceSummary,
  action: packet.recommendedAction,
}));

export function getSeverityColor(severity: string) {
  return severityColors[severity] ?? "#f59e0b";
}
