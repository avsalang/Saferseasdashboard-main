export type RiskBandId = "low" | "moderate" | "high" | "critical";

export type RiskCategoryId =
  | "consequenceProfile"
  | "vesselCondition"
  | "statutoryCompliance"
  | "incidentRecurrence"
  | "operatorFleetPerformance"
  | "routeExposure"
  | "weatherExposure";

export type RiskBooleanInputKey =
  | "passengerOrRoroPassenger"
  | "tankerChemicalOrHnsCargo"
  | "pollutionSensitiveCargoOrWaters"
  | "classLapsedOrNoClass"
  | "overdueDrydockOrSurvey"
  | "expiredOrInvalidStatutoryCertificate"
  | "certificateDueWithin30Days"
  | "openCriticalDeficiency"
  | "repeatedMajorDeficiency"
  | "detentionOrSuspensionPast36Months"
  | "verySeriousCasualtyPast36Months"
  | "seriousCasualtyPast36Months"
  | "lessSeriousCasualty"
  | "repeatIncidentTypeOrCause"
  | "pollutionDamageOrUnfitToProceed"
  | "fleetVerySeriousCasualtyPast36Months"
  | "aboveAverageFleetDeficiencyRate"
  | "unresolvedSmsFinding"
  | "topQuartileHotspotCorridor"
  | "majorPortApproachOrDenseLane"
  | "exposedOpenSeaOrRemoteSegment"
  | "activePagasaWarning"
  | "roughSeaHighWavePoorVisibility"
  | "monsoonOrTyphoonSeasonExposure"
  | "activeDetentionSuspensionOrNoSailOrder"
  | "personsAboveCertificatedCapacity"
  | "actualManningBelowMinimum"
  | "insufficientLeadingIndicatorData";

export type RiskAssessmentInputs = Record<RiskBooleanInputKey, boolean> & {
  personsAboard: number | null;
  vesselAgeYears: number | null;
};

export type RiskIndicatorDefinition = {
  id: string;
  label: string;
  weight: number;
  hardStop?: boolean;
  inputKey?: RiskBooleanInputKey;
  evaluate?: (inputs: RiskAssessmentInputs) => boolean;
  detail?: string;
};

export type RiskCategoryDefinition = {
  id: RiskCategoryId;
  title: string;
  cap: number;
  description: string;
  indicators: RiskIndicatorDefinition[];
};

export type RiskIndicatorResult = RiskIndicatorDefinition & {
  triggered: boolean;
  points: number;
};

export type RiskCategoryResult = RiskCategoryDefinition & {
  rawScore: number;
  score: number;
  triggeredCount: number;
  triggeredIndicators: RiskIndicatorResult[];
  indicators: RiskIndicatorResult[];
};

export type RiskAssessmentResult = {
  totalScore: number;
  hardStopTriggered: boolean;
  hardStopIndicators: RiskIndicatorResult[];
  manualReviewRequired: boolean;
  band: {
    id: RiskBandId;
    label: string;
    detail: string;
    action: string;
  };
  categoryResults: RiskCategoryResult[];
  triggeredIndicators: RiskIndicatorResult[];
};

const ageBetween = (value: number | null, min: number, max: number) =>
  value !== null && value >= min && value <= max;

const ageAbove = (value: number | null, minExclusive: number) =>
  value !== null && value > minExclusive;

const personsBetween = (value: number | null, min: number, max: number) =>
  value !== null && value >= min && value <= max;

const personsAbove = (value: number | null, minExclusive: number) =>
  value !== null && value > minExclusive;

export const riskAssessmentCategories: RiskCategoryDefinition[] = [
  {
    id: "consequenceProfile",
    title: "Consequence Profile",
    cap: 15,
    description: "Life, cargo, and pollution consequence indicators for the voyage under review.",
    indicators: [
      {
        id: "passengerOrRoroPassenger",
        label: "Passenger or RoRo-passenger service",
        weight: 6,
        inputKey: "passengerOrRoroPassenger",
      },
      {
        id: "tankerChemicalOrHnsCargo",
        label: "Tanker, chemical, LPG, oil, or HNS cargo",
        weight: 5,
        inputKey: "tankerChemicalOrHnsCargo",
      },
      {
        id: "personsAboard13to100",
        label: "Persons aboard 13-100",
        weight: 2,
        detail: "Derived from persons aboard input.",
        evaluate: (inputs) => personsBetween(inputs.personsAboard, 13, 100),
      },
      {
        id: "personsAboardOver100",
        label: "Persons aboard above 100",
        weight: 4,
        detail: "Derived from persons aboard input.",
        evaluate: (inputs) => personsAbove(inputs.personsAboard, 100),
      },
      {
        id: "pollutionSensitiveCargoOrWaters",
        label: "Pollution-sensitive cargo or waters",
        weight: 3,
        inputKey: "pollutionSensitiveCargoOrWaters",
      },
    ],
  },
  {
    id: "vesselCondition",
    title: "Vessel Condition",
    cap: 10,
    description: "Age and condition indicators aligned to the workbook logic.",
    indicators: [
      {
        id: "age10to20",
        label: "Vessel age 10-20 years",
        weight: 2,
        detail: "Derived from vessel age input.",
        evaluate: (inputs) => ageBetween(inputs.vesselAgeYears, 10, 20),
      },
      {
        id: "age21to30",
        label: "Vessel age 21-30 years",
        weight: 4,
        detail: "Derived from vessel age input.",
        evaluate: (inputs) => ageBetween(inputs.vesselAgeYears, 21, 30),
      },
      {
        id: "ageAbove30",
        label: "Vessel age above 30 years",
        weight: 6,
        detail: "Derived from vessel age input.",
        evaluate: (inputs) => ageAbove(inputs.vesselAgeYears, 30),
      },
      {
        id: "classLapsedOrNoClass",
        label: "Class lapsed or no class",
        weight: 4,
        inputKey: "classLapsedOrNoClass",
      },
      {
        id: "overdueDrydockOrSurvey",
        label: "Overdue drydock or annual survey",
        weight: 2,
        inputKey: "overdueDrydockOrSurvey",
      },
    ],
  },
  {
    id: "statutoryCompliance",
    title: "Statutory Compliance",
    cap: 25,
    description: "Certificate, deficiency, and compliance history signals, including hard-stop triggers.",
    indicators: [
      {
        id: "expiredOrInvalidStatutoryCertificate",
        label: "Expired or invalid statutory certificate",
        weight: 15,
        hardStop: true,
        inputKey: "expiredOrInvalidStatutoryCertificate",
      },
      {
        id: "certificateDueWithin30Days",
        label: "Certificate due within 30 days",
        weight: 5,
        inputKey: "certificateDueWithin30Days",
      },
      {
        id: "openCriticalDeficiency",
        label: "Open critical deficiency",
        weight: 10,
        hardStop: true,
        inputKey: "openCriticalDeficiency",
      },
      {
        id: "repeatedMajorDeficiency",
        label: "Repeated major deficiency",
        weight: 6,
        inputKey: "repeatedMajorDeficiency",
      },
      {
        id: "detentionOrSuspensionPast36Months",
        label: "Detention, suspension, or no-sail in past 36 months",
        weight: 10,
        inputKey: "detentionOrSuspensionPast36Months",
      },
    ],
  },
  {
    id: "incidentRecurrence",
    title: "Incident Recurrence",
    cap: 15,
    description: "Rolling casualty and recurrence history from the workbook model.",
    indicators: [
      {
        id: "verySeriousCasualtyPast36Months",
        label: "Very serious casualty in past 36 months",
        weight: 8,
        inputKey: "verySeriousCasualtyPast36Months",
      },
      {
        id: "seriousCasualtyPast36Months",
        label: "Serious casualty in past 36 months",
        weight: 5,
        inputKey: "seriousCasualtyPast36Months",
      },
      {
        id: "lessSeriousCasualty",
        label: "Less serious casualty",
        weight: 2,
        inputKey: "lessSeriousCasualty",
      },
      {
        id: "repeatIncidentTypeOrCause",
        label: "Repeat same incident type or coded cause two or more times",
        weight: 5,
        inputKey: "repeatIncidentTypeOrCause",
      },
      {
        id: "pollutionDamageOrUnfitToProceed",
        label: "Pollution, material damage, or unfit-to-proceed outcome",
        weight: 3,
        inputKey: "pollutionDamageOrUnfitToProceed",
      },
    ],
  },
  {
    id: "operatorFleetPerformance",
    title: "Operator and Fleet Performance",
    cap: 10,
    description: "Fleet and operator-level performance signals used by the model.",
    indicators: [
      {
        id: "fleetVerySeriousCasualtyPast36Months",
        label: "Fleet very serious casualty in past 36 months",
        weight: 6,
        inputKey: "fleetVerySeriousCasualtyPast36Months",
      },
      {
        id: "aboveAverageFleetDeficiencyRate",
        label: "Above-average fleet deficiency, detention, or suspension rate",
        weight: 4,
        inputKey: "aboveAverageFleetDeficiencyRate",
      },
      {
        id: "unresolvedSmsFinding",
        label: "Unresolved DOC, SMC, or SMS finding",
        weight: 4,
        inputKey: "unresolvedSmsFinding",
      },
    ],
  },
  {
    id: "routeExposure",
    title: "Route Exposure",
    cap: 10,
    description: "Geospatial and corridor-exposure markers from the workbook.",
    indicators: [
      {
        id: "topQuartileHotspotCorridor",
        label: "Top-quartile historical hotspot corridor",
        weight: 5,
        inputKey: "topQuartileHotspotCorridor",
      },
      {
        id: "majorPortApproachOrDenseLane",
        label: "Major port approach or dense ferry lane",
        weight: 3,
        inputKey: "majorPortApproachOrDenseLane",
      },
      {
        id: "exposedOpenSeaOrRemoteSegment",
        label: "Exposed open-sea, Pacific-facing, or remote segment",
        weight: 2,
        inputKey: "exposedOpenSeaOrRemoteSegment",
      },
    ],
  },
  {
    id: "weatherExposure",
    title: "Weather Exposure",
    cap: 15,
    description: "Voyage-window weather and sea-state exposure from the model.",
    indicators: [
      {
        id: "activePagasaWarning",
        label: "Active PAGASA warning at sailing window",
        weight: 8,
        inputKey: "activePagasaWarning",
      },
      {
        id: "roughSeaHighWavePoorVisibility",
        label: "Rough sea, high wave, or poor visibility",
        weight: 4,
        inputKey: "roughSeaHighWavePoorVisibility",
      },
      {
        id: "monsoonOrTyphoonSeasonExposure",
        label: "Monsoon or typhoon-season route exposure",
        weight: 3,
        inputKey: "monsoonOrTyphoonSeasonExposure",
      },
    ],
  },
];

export const additionalHardStopIndicators: RiskIndicatorDefinition[] = [
  {
    id: "activeDetentionSuspensionOrNoSailOrder",
    label: "Active detention, suspension, or no-sail order",
    weight: 0,
    hardStop: true,
    inputKey: "activeDetentionSuspensionOrNoSailOrder",
  },
  {
    id: "personsAboveCertificatedCapacity",
    label: "Persons aboard above certificated capacity",
    weight: 0,
    hardStop: true,
    inputKey: "personsAboveCertificatedCapacity",
  },
  {
    id: "actualManningBelowMinimum",
    label: "Actual manning below minimum safe manning",
    weight: 0,
    hardStop: true,
    inputKey: "actualManningBelowMinimum",
  },
];

export const manualReviewIndicator: RiskIndicatorDefinition = {
  id: "insufficientLeadingIndicatorData",
  label: "Insufficient data / manual review",
  weight: 0,
  inputKey: "insufficientLeadingIndicatorData",
};

export function createDefaultRiskAssessmentInputs(): RiskAssessmentInputs {
  return {
    personsAboard: null,
    vesselAgeYears: null,
    passengerOrRoroPassenger: false,
    tankerChemicalOrHnsCargo: false,
    pollutionSensitiveCargoOrWaters: false,
    classLapsedOrNoClass: false,
    overdueDrydockOrSurvey: false,
    expiredOrInvalidStatutoryCertificate: false,
    certificateDueWithin30Days: false,
    openCriticalDeficiency: false,
    repeatedMajorDeficiency: false,
    detentionOrSuspensionPast36Months: false,
    verySeriousCasualtyPast36Months: false,
    seriousCasualtyPast36Months: false,
    lessSeriousCasualty: false,
    repeatIncidentTypeOrCause: false,
    pollutionDamageOrUnfitToProceed: false,
    fleetVerySeriousCasualtyPast36Months: false,
    aboveAverageFleetDeficiencyRate: false,
    unresolvedSmsFinding: false,
    topQuartileHotspotCorridor: false,
    majorPortApproachOrDenseLane: false,
    exposedOpenSeaOrRemoteSegment: false,
    activePagasaWarning: false,
    roughSeaHighWavePoorVisibility: false,
    monsoonOrTyphoonSeasonExposure: false,
    activeDetentionSuspensionOrNoSailOrder: false,
    personsAboveCertificatedCapacity: false,
    actualManningBelowMinimum: false,
    insufficientLeadingIndicatorData: false,
  };
}

export function getRiskBandFromScore(score: number, hardStopTriggered: boolean) {
  if (hardStopTriggered) {
    return {
      id: "critical" as const,
      label: "Critical",
      detail: "Hard stop triggered (No Sail)",
      action: "Immediate MARINA-PCG verification; recommend hold, no-sail, or certificate action.",
    };
  }

  if (score <= 24) {
    return {
      id: "low" as const,
      label: "Low",
      detail: "0-24 | Routine monitoring",
      action: "Routine monitoring and normal inspection cycle.",
    };
  }

  if (score <= 44) {
    return {
      id: "moderate" as const,
      label: "Moderate",
      detail: "25-44 | Targeted review",
      action: "Targeted document review and next regional inspection queue.",
    };
  }

  if (score <= 64) {
    return {
      id: "high" as const,
      label: "High",
      detail: "45-64 | Priority inspection",
      action: "Priority onboard inspection plus operator corrective-action plan or SMS review.",
    };
  }

  return {
    id: "critical" as const,
    label: "Critical",
    detail: "65-100 | Immediate verification",
    action: "Immediate MARINA-PCG verification and escalation for control measures.",
  };
}

function evaluateIndicator(indicator: RiskIndicatorDefinition, inputs: RiskAssessmentInputs): RiskIndicatorResult {
  const triggered = indicator.evaluate
    ? indicator.evaluate(inputs)
    : indicator.inputKey
      ? inputs[indicator.inputKey]
      : false;

  return {
    ...indicator,
    triggered,
    points: triggered ? indicator.weight : 0,
  };
}

export function evaluateRiskAssessment(inputs: RiskAssessmentInputs): RiskAssessmentResult {
  const categoryResults = riskAssessmentCategories.map((category) => {
    const indicators = category.indicators.map((indicator) => evaluateIndicator(indicator, inputs));
    const rawScore = indicators.reduce((sum, indicator) => sum + indicator.points, 0);
    const score = Math.min(rawScore, category.cap);
    const triggeredIndicators = indicators.filter((indicator) => indicator.triggered);

    return {
      ...category,
      rawScore,
      score,
      triggeredCount: triggeredIndicators.length,
      triggeredIndicators,
      indicators,
    };
  });

  const additionalHardStops = additionalHardStopIndicators
    .map((indicator) => evaluateIndicator(indicator, inputs))
    .filter((indicator) => indicator.triggered);
  const hardStopIndicators = [
    ...categoryResults.flatMap((category) => category.triggeredIndicators.filter((indicator) => indicator.hardStop)),
    ...additionalHardStops,
  ];
  const totalScore = categoryResults.reduce((sum, category) => sum + category.score, 0);
  const hardStopTriggered = hardStopIndicators.length > 0;
  const manualReviewRequired = inputs.insufficientLeadingIndicatorData;

  return {
    totalScore,
    hardStopTriggered,
    hardStopIndicators,
    manualReviewRequired,
    band: getRiskBandFromScore(totalScore, hardStopTriggered),
    categoryResults,
    triggeredIndicators: categoryResults.flatMap((category) => category.triggeredIndicators),
  };
}
