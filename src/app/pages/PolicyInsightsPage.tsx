import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import { AnalyticsFiltersPanel } from "../components/analytics/AnalyticsFiltersPanel";
import { CaveatBanner } from "../components/analytics/CaveatBanner";
import { KpiCard } from "../components/analytics/KpiCard";
import { EvidenceStrengthPanel } from "../components/policy/EvidenceStrengthPanel";
import { PolicyPriorityRegister } from "../components/policy/PolicyPriorityRegister";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  ANALYTICS_CAVEAT,
  analyticsRecords,
  buildIncidentTypePareto,
  buildKpiSummary,
  buildPolicyPriorityItems,
  buildProvinceBurden,
  buildRouteBurden,
  getEvidenceStrengthSummary,
} from "../analytics";
import { buildIncidentExplorerPath } from "../analytics/drilldown";
import { createDefaultFilters, filterRecords, getFilterOptions, summarizeFilterSelection } from "../analytics/filters";

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number) {
  const normalized = String(value ?? "");
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function PolicyInsightsPage() {
  const navigate = useNavigate();
  const filterOptions = useMemo(() => getFilterOptions(analyticsRecords), []);
  const [filters, setFilters] = useState(() => createDefaultFilters(filterOptions));
  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(createDefaultFilters(filterOptions));

  const filteredRecords = useMemo(() => filterRecords(analyticsRecords, filters), [filters]);
  const kpis = useMemo(() => buildKpiSummary(filteredRecords), [filteredRecords]);
  const evidenceStrength = useMemo(() => getEvidenceStrengthSummary(filteredRecords), [filteredRecords]);
  const policyItems = useMemo(() => buildPolicyPriorityItems(filteredRecords, filters), [filteredRecords, filters]);
  const leadingType = useMemo(() => buildIncidentTypePareto(filteredRecords)[0], [filteredRecords]);
  const topProvince = useMemo(() => buildProvinceBurden(filteredRecords, "records")[0], [filteredRecords]);
  const topRoute = useMemo(
    () => buildRouteBurden(filteredRecords).find((entry) => entry.routeLabel !== "Unknown / incomplete"),
    [filteredRecords],
  );
  const highestCasualtyType = useMemo(() => {
    return Array.from(
      filteredRecords.reduce((map, record) => {
        map.set(record.incidentType, (map.get(record.incidentType) ?? 0) + record.totalCasualties);
        return map;
      }, new Map<string, number>()),
    )
      .map(([incidentType, totalCasualties]) => ({ incidentType, totalCasualties }))
      .sort((left, right) => right.totalCasualties - left.totalCasualties)[0];
  }, [filteredRecords]);
  const reviewedRecords = filteredRecords.filter(
    (record) => record.reviewStatus === "Verified" || record.reviewStatus === "Published",
  ).length;

  const [selectedForExport, setSelectedForExport] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedForExport((current) => {
      const next: Record<string, boolean> = {};
      policyItems.forEach((item) => {
        next[item.id] = current[item.id] ?? item.includeInExport;
      });
      return next;
    });
  }, [policyItems]);

  const selectedItems = policyItems.filter((item) => selectedForExport[item.id] ?? item.includeInExport);

  const summaryCards = [
    {
      title: "Leading reported incident type",
      value: leadingType?.incidentType ?? "N/A",
      context: `${leadingType?.records ?? 0} records`,
      formula: "Highest record count among incident types in the current selection.",
      accentClassName: "text-blue-700",
    },
    {
      title: "Top reported province",
      value: topProvince?.label ?? "N/A",
      context: `${topProvince?.records ?? 0} records`,
      formula: "Province with the highest record count in the current selection.",
      accentClassName: "text-red-700",
    },
    {
      title: "Reviewed records",
      value: reviewedRecords,
      context: "Verified or published records",
      formula: "Count of filtered records whose review status is Verified or Published.",
      accentClassName: "text-cyan-700",
    },
    {
      title: "Linked evidence records",
      value: kpis.linkedEvidence,
      context: `${kpis.linkedEvidencePct}% of filtered records`,
      formula: "Records with one or more linked documents in the current selection.",
      accentClassName: "text-violet-700",
    },
    {
      title: "Complete minimum dataset records",
      value: `${kpis.minimumDataset.complete} / ${kpis.minimumDataset.total}`,
      context: `${kpis.minimumDataset.percentage}% complete minimum dataset coverage`,
      formula: "Records with incident ID, timestamp, incident type, severity, location, vessel identifier, reporting authority, and narrative summary.",
      accentClassName: "text-emerald-700",
    },
    {
      title: "Records needing follow-up",
      value: kpis.followUp,
      context: "Under review or missing key review fields",
      formula: "Records that are under review, missing the minimum dataset, missing cause findings, or missing linked evidence.",
      accentClassName: "text-slate-900",
    },
  ];

  const handleExportCsv = () => {
    const headers = [
      "review_area",
      "evidence_signal",
      "supporting_metric",
      "recommended_follow_up",
      "responsible_unit",
      "confidence",
      "data_limitation",
      "filters_applied",
      "exported_at",
    ];
    const filterSummary = summarizeFilterSelection(filters);
    const exportedAt = new Date().toISOString();

    const rows = selectedItems.map((item) => [
      item.reviewArea,
      item.evidenceSignal,
      item.supportingMetric,
      item.recommendedFollowUp,
      item.responsibleUnit ?? "Review team",
      item.confidence,
      item.dataLimitation,
      filterSummary,
      exportedAt,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
    downloadFile("saferseas-policy-review.csv", csv, "text/csv;charset=utf-8");
  };

  const openExplorer = (
    matchingRecords: typeof filteredRecords,
    context: string,
    options: {
      search?: string;
      type?: string;
      severity?: string;
      authority?: string;
      status?: string;
      province?: string;
    } = {},
  ) => {
    if (!matchingRecords.length) {
      return;
    }

    navigate(
      buildIncidentExplorerPath(matchingRecords, {
        context,
        ...options,
      }),
    );
  };

  const openPolicyItemCases = (itemId: string) => {
    if (itemId === "leading-incident-type" && leadingType?.incidentType) {
      openExplorer(
        filteredRecords.filter((record) => record.incidentType === leadingType.incidentType),
        `Policy Review · ${leadingType.incidentType}`,
        { type: leadingType.incidentType },
      );
      return;
    }

    if (itemId === "high-casualty-burden" && highestCasualtyType?.incidentType) {
      openExplorer(
        filteredRecords.filter((record) => record.incidentType === highestCasualtyType.incidentType),
        `Policy Review · ${highestCasualtyType.incidentType} casualty burden`,
        { type: highestCasualtyType.incidentType },
      );
      return;
    }

    if (itemId === "location-concentration" && topProvince?.label) {
      openExplorer(
        filteredRecords.filter((record) => record.province === topProvince.label),
        `Policy Review · ${topProvince.label}`,
        { province: topProvince.label },
      );
      return;
    }

    if (itemId === "route-review" && topRoute?.routeLabel) {
      openExplorer(
        filteredRecords.filter((record) => record.routeLabel === topRoute.routeLabel),
        `Policy Review · ${topRoute.routeLabel}`,
        { search: topRoute.routeLabel },
      );
      return;
    }

    if (itemId === "weather-operations") {
      openExplorer(
        filteredRecords.filter(
          (record) =>
            (record.severityLevel === "Serious" || record.severityLevel === "Very Serious") &&
            record.weatherConditionCategory !== "Good conditions" &&
            record.weatherConditionCategory !== "Unknown",
        ),
        "Policy Review · Weather and sea-state operations",
      );
      return;
    }

    openExplorer(filteredRecords, `Policy Review · ${itemId}`);
  };

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl text-slate-900">Policy Review</h1>
          <p className="text-slate-600">
            Evidence-to-action review register grounded in submitted incident records and measured data completeness
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Print / Save PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportCsv} disabled={!selectedItems.length}>
            <FileText className="h-4 w-4" />
            Export Review Summary (CSV)
          </Button>
        </div>
      </div>

      <CaveatBanner text={ANALYTICS_CAVEAT} />

      <AnalyticsFiltersPanel
        filters={filters}
        options={filterOptions}
        recordCount={filteredRecords.length}
        onChange={updateFilter}
        onReset={resetFilters}
        description="Apply the same record filters used for analytics so the review register, evidence panel, and export stay aligned."
      />

      {filteredRecords.length < 10 && filteredRecords.length > 0 && (
        <CaveatBanner text="Small sample. Interpret with caution." tone="warning" />
      )}

      {kpis.minimumDataset.percentage < 60 && filteredRecords.length > 0 && (
        <CaveatBanner text="Field completeness below 60%. Recommendation confidence is low." tone="warning" />
      )}

      {!filteredRecords.length ? (
        <Card>
          <CardContent className="px-6 py-8 text-sm text-slate-600">
            No records match the current filters.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <KpiCard
                key={card.title}
                title={card.title}
                value={card.value}
                context={card.context}
                formula={card.formula}
                accentClassName={card.accentClassName}
              />
            ))}
          </div>

          <EvidenceStrengthPanel summary={evidenceStrength} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Policy Priority Register</CardTitle>
                <CardDescription>
                  Review items generated only from the filtered records and available field completeness
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {selectedItems.length} of {policyItems.length} review items are currently selected for export.
                </div>
                <PolicyPriorityRegister
                  items={policyItems}
                  selected={selectedForExport}
                  onToggle={(id, next) => setSelectedForExport((current) => ({ ...current, [id]: next }))}
                  onOpen={(item) => openPolicyItemCases(item.id)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Notes</CardTitle>
                <CardDescription>
                  Guardrails for interpreting the current evidence set
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  Use the register to prioritize review work, not to assert exposure-normalized risk.
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  Route, location, and vessel-age patterns should be validated against exposure data before becoming formal policy claims.
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  Weather context supports operational review, but it does not establish causation on its own.
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  Possible duplicate records in the current selection: {evidenceStrength.possibleDuplicateRecords}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
