export const ANALYTICS_CAVEAT =
  "Metrics are based on submitted incident records only. They are not exposure-normalized. Risk rates require voyage, fleet, passenger, cargo, port-call, or AIS exposure denominators.";

export const SEVERITY_ORDER = ["Very Serious", "Serious", "Less Serious", "Near Miss", "Unknown"] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  "Very Serious": "#991b1b",
  Serious: "#dc2626",
  "Less Serious": "#f97316",
  "Near Miss": "#f59e0b",
  Unknown: "#64748b",
};

export const REVIEW_STATUS_ORDER = [
  "Submitted",
  "Under Review",
  "Verified",
  "Published",
  "Returned",
  "Unknown",
] as const;

export const VESSEL_AGE_BANDS = ["0-5", "6-10", "11-20", "21-30", "31+", "Unknown"] as const;

export const FIELD_GROUP_ORDER = [
  "Core identifiers",
  "Location details",
  "Vessel registry",
  "Ownership / operator",
  "Voyage / route",
  "Cause and investigation",
  "Linked evidence",
] as const;

export const WEATHER_CATEGORY_ORDER = [
  "Good conditions",
  "Moderate conditions",
  "Adverse conditions",
  "Unknown",
] as const;

export const LINKED_EVIDENCE_STATUS_ORDER = ["Linked evidence", "No linked evidence"] as const;

export const CAUSE_CATEGORY_ORDER = [
  "Navigation error",
  "Mechanical failure",
  "Human error",
  "Weather/sea condition",
  "Poor visibility",
  "Overloading",
  "Communication failure",
  "Maintenance issue",
  "Regulatory non-compliance",
  "Crew response issue",
  "Infrastructure/port-related issue",
  "Unknown / under investigation",
  "Other",
] as const;

export const QUARTER_OPTIONS = [
  { value: "all", label: "All Quarters" },
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
] as const;
