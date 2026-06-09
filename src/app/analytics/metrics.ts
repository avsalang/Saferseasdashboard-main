import { CAUSE_CATEGORY_ORDER } from "./constants.ts";
import type { AnalyticsRecord, ReviewStatus, SeverityLevel } from "./types.ts";
import type { Incident } from "../data/mockIncidents.ts";

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function normalizeWhitespace(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function normalizeKey(value?: string | null) {
  return normalizeWhitespace(value).toLowerCase();
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .map((segment) => (segment ? `${segment[0].toUpperCase()}${segment.slice(1)}` : segment))
    .join(" ");
}

export function getDateParts(dateTime: string) {
  const date = new Date(dateTime);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const month = monthIndex + 1;
  const quarter = `Q${Math.floor(monthIndex / 3) + 1}` as const;
  return {
    incidentYear: year,
    incidentQuarter: quarter,
    incidentMonth: month,
    incidentMonthKey: `${year}-${String(month).padStart(2, "0")}`,
    incidentMonthLabel: `${monthFormatter.format(date)} ${String(year).slice(2)}`,
  };
}

export function getTotalCasualties(record: Pick<Incident, "fatalities" | "injuries">) {
  return (record.fatalities ?? 0) + (record.injuries ?? 0);
}

export function getVesselAge(incidentDateTime: string, yearBuilt?: number) {
  if (!isFiniteNumber(yearBuilt) || yearBuilt <= 0) {
    return null;
  }

  const incidentYear = new Date(incidentDateTime).getUTCFullYear();
  const vesselAge = incidentYear - yearBuilt;
  if (!Number.isFinite(vesselAge) || vesselAge < 0 || vesselAge > 200) {
    return null;
  }

  return vesselAge;
}

export function getVesselAgeBand(age: number | null) {
  if (age === null) {
    return "Unknown";
  }
  if (age <= 5) {
    return "0-5";
  }
  if (age <= 10) {
    return "6-10";
  }
  if (age <= 20) {
    return "11-20";
  }
  if (age <= 30) {
    return "21-30";
  }
  return "31+";
}

export function getRouteKey(voyageOrigin?: string, voyageDestination?: string) {
  const origin = normalizeKey(voyageOrigin);
  const destination = normalizeKey(voyageDestination);

  if (!origin || !destination) {
    return "unknown / incomplete";
  }

  return `${origin} -> ${destination}`;
}

export function getRouteLabel(voyageOrigin?: string, voyageDestination?: string) {
  const origin = normalizeWhitespace(voyageOrigin);
  const destination = normalizeWhitespace(voyageDestination);

  if (!origin || !destination) {
    return "Unknown / incomplete";
  }

  return `${origin} -> ${destination}`;
}

function categorizeFromPatterns(input: string, patterns: Array<[RegExp, string]>) {
  const matched = patterns.find(([pattern]) => pattern.test(input));
  return matched?.[1] ?? "Other";
}

export function getCauseCategory(primaryCause?: string, findingsOfCause?: string) {
  const source = `${normalizeWhitespace(primaryCause)} ${normalizeWhitespace(findingsOfCause)}`.toLowerCase();
  if (!source) {
    return "Unknown / under investigation";
  }
  if (source.includes("under investigation") || source.includes("pending")) {
    return "Unknown / under investigation";
  }

  const category = categorizeFromPatterns(source, [
    [/navigation|collision|grounding|bridge|lookout|passing/, "Navigation error"],
    [/mechanical|machinery|engine|generator|electrical|pump|lubrication/, "Mechanical failure"],
    [/human error|human factor|fatigue|judgment/, "Human error"],
    [/weather|sea condition|swell|squall|rough sea|monsoon|storm/, "Weather/sea condition"],
    [/visibility|fog|mist|low visibility/, "Poor visibility"],
    [/overload|overloading|weight shift/, "Overloading"],
    [/communication|vhf|coordination/, "Communication failure"],
    [/maintenance|inspection|deferred|seal issue/, "Maintenance issue"],
    [/non-compliance|procedure|regulatory|violation/, "Regulatory non-compliance"],
    [/crew response|crew action|response delay|training/, "Crew response issue"],
    [/port|berth|anchorage|pilotage|infrastructure/, "Infrastructure/port-related issue"],
  ]);

  return CAUSE_CATEGORY_ORDER.includes(category as (typeof CAUSE_CATEGORY_ORDER)[number]) ? category : "Other";
}

export function getWeatherConditionCategory(weather?: Incident["weather"]) {
  if (!weather) {
    return "Unknown";
  }

  const visibility = normalizeKey(weather.visibility);
  const waveHeight = weather.waveHeight ?? 0;
  const windForce = weather.windForce ?? 0;

  if (!visibility && !waveHeight && !windForce) {
    return "Unknown";
  }

  if (visibility === "poor" || waveHeight >= 2.5 || windForce >= 6) {
    return "Adverse conditions";
  }
  if (visibility === "moderate" || waveHeight >= 1.5 || windForce >= 4) {
    return "Moderate conditions";
  }
  return "Good conditions";
}

export function getLinkedEvidenceStatus(linkedDocuments?: string[]) {
  return linkedDocuments?.length ? "Linked evidence" : "No linked evidence";
}

export function mapSeverityLevel(severity?: string): SeverityLevel {
  if (severity === "Very Serious" || severity === "Serious" || severity === "Less Serious" || severity === "Near Miss") {
    return severity;
  }
  return "Unknown";
}

export function mapReviewStatus(status?: string): ReviewStatus {
  if (status === "Submitted" || status === "Under Review" || status === "Verified" || status === "Published" || status === "Returned") {
    return status;
  }
  return "Unknown";
}

export function hasCoordinates(incident: Incident) {
  return isFiniteNumber(incident.location?.lat) && isFiniteNumber(incident.location?.lng);
}

export function hasWeatherContext(incident: Incident) {
  return Boolean(
    incident.weather &&
      ((incident.weather.waveHeight ?? 0) > 0 ||
        (incident.weather.windForce ?? 0) > 0 ||
        normalizeWhitespace(incident.weather.visibility)),
  );
}

export function hasVerifiedCauseFindings(incident: Incident) {
  return Boolean(normalizeWhitespace(incident.findingsOfCause) && getCauseCategory(incident.primaryCause, incident.findingsOfCause) !== "Unknown / under investigation");
}

export function buildAnalyticsRecord(incident: Incident): AnalyticsRecord {
  const dateParts = getDateParts(incident.date);
  const vesselAge = getVesselAge(incident.date, incident.yearBuilt);
  const minimumDatasetComplete = false;

  return {
    ...incident,
    incidentId: incident.id,
    incidentDateTime: incident.date,
    ...dateParts,
    incidentType: incident.type,
    severityLevel: mapSeverityLevel(incident.severity),
    fatalitiesCount: incident.fatalities ?? 0,
    injuriesCount: incident.injuries ?? 0,
    totalCasualties: getTotalCasualties(incident),
    totalPersonsOnboard: (incident.passengerCount ?? 0) + (incident.crewCount ?? 0),
    province: incident.location?.province ?? "Unknown",
    nearestPort: incident.location?.port ?? "Unknown",
    vesselTypeClass: incident.vesselType ?? "Unknown",
    reportingAuthority: incident.authority ?? "Unknown",
    methodOfReporting: incident.reportingMethod ?? "Unspecified",
    reviewStatus: mapReviewStatus(incident.status),
    causeCategory: getCauseCategory(incident.primaryCause, incident.findingsOfCause),
    weatherConditionCategory: getWeatherConditionCategory(incident.weather),
    linkedEvidenceStatus: getLinkedEvidenceStatus(incident.linkedDocuments),
    vesselAge,
    vesselAgeBand: getVesselAgeBand(vesselAge),
    routeKey: getRouteKey(incident.voyageOrigin, incident.voyageDestination),
    routeLabel: getRouteLabel(incident.voyageOrigin, incident.voyageDestination),
    hasCoordinates: hasCoordinates(incident),
    hasLinkedEvidence: Boolean(incident.linkedDocuments?.length),
    hasVerifiedCauseFindings: hasVerifiedCauseFindings(incident),
    hasWeatherContext: hasWeatherContext(incident),
    minimumDatasetComplete,
  };
}
