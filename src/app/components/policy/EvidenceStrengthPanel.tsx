import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { EvidenceStrengthSummary } from "../../analytics/types";

interface EvidenceStrengthPanelProps {
  summary: EvidenceStrengthSummary;
}

export function EvidenceStrengthPanel({ summary }: EvidenceStrengthPanelProps) {
  const rows = [
    { label: "Sample size", value: summary.sampleSize, context: "records in current selection" },
    { label: "Required field completeness", value: `${summary.requiredFieldCompletenessPct}%`, context: "minimum dataset coverage" },
    { label: "Geocoded records", value: summary.geocodedRecords, context: "records with coordinates" },
    { label: "Verified cause findings", value: summary.verifiedCauseRecords, context: "records with cause findings" },
    { label: "Linked evidence records", value: summary.linkedEvidenceRecords, context: "records with attachments" },
    { label: "Weather context records", value: summary.weatherContextRecords, context: "records with weather/sea conditions" },
    { label: "Possible duplicates", value: summary.possibleDuplicateRecords, context: "records needing duplicate review" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Strength</CardTitle>
        <CardDescription>How complete the current policy review evidence base is</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs text-slate-500">{row.label}</div>
            <div className="mt-1 text-2xl text-slate-900">{row.value}</div>
            <div className="text-xs text-slate-500">{row.context}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
