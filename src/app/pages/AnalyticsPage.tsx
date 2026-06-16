import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { AnalyticsFiltersPanel } from "../components/analytics/AnalyticsFiltersPanel";
import { CaveatBanner } from "../components/analytics/CaveatBanner";
import { HeatmapGrid } from "../components/analytics/HeatmapGrid";
import { KpiCard } from "../components/analytics/KpiCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ANALYTICS_CAVEAT,
  analyticsRecords,
  buildCausePareto,
  buildIncidentTypePareto,
  buildKpiSummary,
  buildProvinceBurden,
  buildRouteBurden,
  buildTypeSeverityHeatmap,
  buildWeatherSeverityHeatmap,
} from "../analytics";
import { buildIncidentExplorerPath } from "../analytics/drilldown";
import { createDefaultFilters, filterRecords, getFilterOptions } from "../analytics/filters";

type BurdenMetric = "records" | "totalCasualties" | "verySerious";

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
};

const seriesColors = {
  incidents: "#1d4ed8",
  fatalities: "#991b1b",
  injuries: "#f97316",
};

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

function buildPeriodBurdenData(records: typeof analyticsRecords, groupByYear: boolean) {
  return Array.from(
    records.reduce((map, record) => {
      const key = groupByYear ? String(record.incidentYear) : record.incidentMonthKey;
      const current = map.get(key) ?? {
        periodKey: key,
        period: groupByYear ? String(record.incidentYear) : record.incidentMonthLabel,
        incidents: 0,
        fatalities: 0,
        injuries: 0,
        totalCasualties: 0,
      };

      current.incidents += 1;
      current.fatalities += record.fatalitiesCount;
      current.injuries += record.injuriesCount;
      current.totalCasualties += record.totalCasualties;
      map.set(key, current);
      return map;
    }, new Map<string, {
      periodKey: string;
      period: string;
      incidents: number;
      fatalities: number;
      injuries: number;
      totalCasualties: number;
    }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => left.periodKey.localeCompare(right.periodKey));
}

function buildVesselTypeIncidentHeatmap(records: typeof analyticsRecords, incidentTypes: string[]) {
  const vesselTypes = Array.from(new Set(records.map((record) => record.vesselTypeClass))).sort((left, right) => {
    const leftTotal = records.filter((record) => record.vesselTypeClass === left).length;
    const rightTotal = records.filter((record) => record.vesselTypeClass === right).length;
    return rightTotal - leftTotal;
  });

  return vesselTypes.map((vesselType) => ({
    label: vesselType,
    cells: incidentTypes.map((incidentType) => {
      const count = records.filter(
        (record) => record.vesselTypeClass === vesselType && record.incidentType === incidentType,
      ).length;
      return {
        key: incidentType,
        value: count,
        text: String(count),
      };
    }),
  }));
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const filterOptions = useMemo(() => getFilterOptions(analyticsRecords), []);
  const [filters, setFilters] = useState(() => createDefaultFilters(filterOptions));
  const [incidentTypeMetric, setIncidentTypeMetric] = useState<BurdenMetric>("records");
  const [provinceMetric, setProvinceMetric] = useState<BurdenMetric>("records");

  const updateFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(createDefaultFilters(filterOptions));

  const filteredRecords = useMemo(() => filterRecords(analyticsRecords, filters), [filters]);
  const kpis = useMemo(() => buildKpiSummary(filteredRecords), [filteredRecords]);
  const periodBurdenData = useMemo(
    () => buildPeriodBurdenData(filteredRecords, filters.year === "all"),
    [filteredRecords, filters.year],
  );
  const incidentTypePareto = useMemo(() => buildIncidentTypePareto(filteredRecords), [filteredRecords]);
  const typeSeverityHeatmap = useMemo(() => buildTypeSeverityHeatmap(filteredRecords), [filteredRecords]);
  const provinceBurden = useMemo(() => buildProvinceBurden(filteredRecords, provinceMetric), [filteredRecords, provinceMetric]);
  const routeBurden = useMemo(() => buildRouteBurden(filteredRecords), [filteredRecords]);
  const weatherSeverityHeatmap = useMemo(() => buildWeatherSeverityHeatmap(filteredRecords), [filteredRecords]);
  const causePareto = useMemo(() => buildCausePareto(filteredRecords), [filteredRecords]);

  const typeSeverityColumns = typeSeverityHeatmap[0]?.cells.map((cell) => cell.key) ?? [];
  const weatherColumns = weatherSeverityHeatmap[0]?.cells.map((cell) => cell.key) ?? [];
  const incidentTypeKeys = useMemo(() => {
    const counts = filteredRecords.reduce((map, record) => {
      map.set(record.incidentType, (map.get(record.incidentType) ?? 0) + 1);
      return map;
    }, new Map<string, number>());

    return Array.from(counts)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([label]) => label);
  }, [filteredRecords]);
  const vesselTypeIncidentHeatmap = useMemo(
    () => buildVesselTypeIncidentHeatmap(filteredRecords, incidentTypeKeys),
    [filteredRecords, incidentTypeKeys],
  );
  const periodModeLabel = filters.year === "all" ? "year" : "incident month";
  const recordsForPeriod = (periodKey?: string) => {
    if (!periodKey) {
      return [];
    }

    return filteredRecords.filter((record) =>
      filters.year === "all" ? String(record.incidentYear) === periodKey : record.incidentMonthKey === periodKey,
    );
  };

  const handleExportAnalyticsCsv = () => {
    const headers = [
      "incident_id",
      "incident_date",
      "incident_type",
      "severity",
      "province",
      "nearest_port",
      "vessel_type",
      "fatalities",
      "injuries",
      "route_label",
      "cause_category",
      "reporting_authority",
      "reporting_channel",
      "review_status",
      "linked_evidence_status",
    ];

    const rows = filteredRecords.map((record) => [
      record.incidentId,
      record.incidentDateTime,
      record.incidentType,
      record.severityLevel,
      record.province,
      record.nearestPort,
      record.vesselTypeClass,
      record.fatalitiesCount,
      record.injuriesCount,
      record.routeLabel,
      record.causeCategory,
      record.reportingAuthority,
      record.methodOfReporting,
      record.reviewStatus,
      record.linkedEvidenceStatus,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
    downloadFile("saferseas-analytics-records.csv", csv, "text/csv;charset=utf-8");
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

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl text-slate-900">Analytics</h1>
          <p className="text-slate-600">
            Evidence-backed analysis of submitted incident patterns, reported burden, and record completeness
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportAnalyticsCsv}>
          <Download className="h-4 w-4" />
          Export filtered records (CSV)
        </Button>
      </div>

      <CaveatBanner text={ANALYTICS_CAVEAT} />

      <AnalyticsFiltersPanel
        filters={filters}
        options={filterOptions}
        recordCount={filteredRecords.length}
        onChange={updateFilter}
        onReset={resetFilters}
        description="Refine the analytics by period, incident profile, route context, weather category, evidence status, and review dimensions."
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-white p-2 shadow-sm">
            <TabsTrigger value="overview" className="flex-none px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="routes-vessels" className="flex-none px-4 py-2">
              Routes & Vessels
            </TabsTrigger>
            <TabsTrigger value="conditions-causes" className="flex-none px-4 py-2">
              Conditions & Causes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              title="Incident Records"
              value={kpis.totalRecords}
              context="Unique incident IDs in the current selection"
              formula="Count of unique incident records after applying the current filters."
              accentClassName="text-blue-700"
            />
            <KpiCard
              title="Fatalities and Injuries"
              value={kpis.totalCasualties}
              context={`${kpis.fatalities} fatalities and ${kpis.injuries} injuries`}
              formula="Sum of fatalities plus injuries across the current filtered records."
              accentClassName="text-red-700"
            />
            <KpiCard
              title="Very Serious Cases"
              value={kpis.verySerious}
              context="Records classified as Very Serious"
              formula="Count of records where severity classification is Very Serious."
              accentClassName="text-amber-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card id="monthly-incident-burden">
              <CardHeader>
                <CardTitle>Incident Records by Period</CardTitle>
                <CardDescription>
                  Submitted records summarized by {periodModeLabel}; select a year filter for monthly detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={periodBurdenData} barCategoryGap="28%">
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="period" stroke="#64748b" />
                    <YAxis allowDecimals={false} stroke="#64748b" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="incidents"
                      name="Incident records"
                      fill={seriesColors.incidents}
                      radius={[8, 8, 0, 0]}
                      onClick={(event) => {
                        const periodKey = event?.periodKey ?? event?.payload?.periodKey;
                        openExplorer(
                          recordsForPeriod(periodKey),
                          `Analytics · ${event?.period ?? event?.payload?.period ?? "Selected period"} incident records`,
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fatalities and Injuries by Period</CardTitle>
                <CardDescription>
                  Fatalities and injuries shown as separate bars for the same {periodModeLabel}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={periodBurdenData} barCategoryGap="18%" barGap={4}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="period" stroke="#64748b" />
                    <YAxis allowDecimals={false} stroke="#64748b" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar
                      dataKey="fatalities"
                      name="Fatalities"
                      fill={seriesColors.fatalities}
                      radius={[8, 8, 0, 0]}
                      onClick={(event) => {
                        const periodKey = event?.periodKey ?? event?.payload?.periodKey;
                        openExplorer(
                          recordsForPeriod(periodKey),
                          `Analytics · ${event?.period ?? event?.payload?.period ?? "Selected period"} fatalities and injuries`,
                        );
                      }}
                    />
                    <Bar
                      dataKey="injuries"
                      name="Injuries"
                      fill={seriesColors.injuries}
                      radius={[8, 8, 0, 0]}
                      onClick={(event) => {
                        const periodKey = event?.periodKey ?? event?.payload?.periodKey;
                        openExplorer(
                          recordsForPeriod(periodKey),
                          `Analytics · ${event?.period ?? event?.payload?.period ?? "Selected period"} fatalities and injuries`,
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card id="incident-type-pareto">
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle>Incident Type Ranking</CardTitle>
                  <CardDescription>
                    Ranked view of which incident types account for the largest reported burden
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant={incidentTypeMetric === "records" ? "default" : "outline"} size="sm" onClick={() => setIncidentTypeMetric("records")}>
                    Record count
                  </Button>
                  <Button variant={incidentTypeMetric === "totalCasualties" ? "default" : "outline"} size="sm" onClick={() => setIncidentTypeMetric("totalCasualties")}>
                    Fatalities + injuries
                  </Button>
                  <Button variant={incidentTypeMetric === "verySerious" ? "default" : "outline"} size="sm" onClick={() => setIncidentTypeMetric("verySerious")}>
                    Very serious cases
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={incidentTypePareto} layout="vertical" margin={{ left: 12, right: 16 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} stroke="#64748b" />
                    <YAxis type="category" dataKey="incidentType" width={140} stroke="#64748b" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey={incidentTypeMetric}
                      name={incidentTypeMetric === "records" ? "Record count" : incidentTypeMetric === "totalCasualties" ? "Fatalities + injuries" : "Very serious cases"}
                      fill="#1d4ed8"
                      radius={[0, 8, 8, 0]}
                      onClick={(event) => {
                        const incidentType = event?.incidentType;
                        openExplorer(
                          filteredRecords.filter((record) => record.incidentType === incidentType),
                          `Analytics · ${incidentType} incident type`,
                          { type: incidentType },
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card id="type-severity-heatmap">
              <CardHeader>
                <CardTitle>Incident Type × Severity</CardTitle>
                <CardDescription>
                  Count of records in each incident-type and severity combination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapGrid
                  columns={typeSeverityColumns}
                  rows={typeSeverityHeatmap}
                  valueLabel="records"
                  palette="rose"
                  onCellClick={(incidentType, severity) => {
                    openExplorer(
                      filteredRecords.filter((record) => record.incidentType === incidentType && record.severityLevel === severity),
                      `Analytics · ${incidentType} × ${severity}`,
                      { type: incidentType, severity },
                    );
                  }}
                />
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          <TabsContent value="routes-vessels" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card id="province-burden">
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle>Province Burden Ranking</CardTitle>
                  <CardDescription>
                    Reported burden by province. Not normalized by port calls, passenger traffic, or vessel movements.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant={provinceMetric === "records" ? "default" : "outline"} size="sm" onClick={() => setProvinceMetric("records")}>
                    Record count
                  </Button>
                  <Button variant={provinceMetric === "totalCasualties" ? "default" : "outline"} size="sm" onClick={() => setProvinceMetric("totalCasualties")}>
                    Fatalities + injuries
                  </Button>
                  <Button variant={provinceMetric === "verySerious" ? "default" : "outline"} size="sm" onClick={() => setProvinceMetric("verySerious")}>
                    Very serious cases
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={provinceBurden.slice(0, 8)} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} stroke="#64748b" />
                    <YAxis type="category" dataKey="label" width={130} stroke="#64748b" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey={provinceMetric}
                      fill="#0f766e"
                      radius={[0, 8, 8, 0]}
                      name={provinceMetric === "records" ? "Record count" : provinceMetric === "totalCasualties" ? "Fatalities + injuries" : "Very serious cases"}
                      onClick={(event) => {
                        const province = event?.label;
                        openExplorer(
                          filteredRecords.filter((record) => record.province === province),
                          `Analytics · ${province} province burden`,
                          { province },
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card id="route-burden">
              <CardHeader>
                <CardTitle>Origin-Destination / Route Review</CardTitle>
                <CardDescription>
                  Repeated submitted OD pairs and route labels in the current selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route / OD pair</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                      <TableHead className="text-right">Fatalities + injuries</TableHead>
                      <TableHead className="text-right">Very serious</TableHead>
                      <TableHead className="text-right">Complete route details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routeBurden.slice(0, 8).map((entry) => (
                      <TableRow key={entry.routeLabel}>
                        <TableCell className="text-slate-900">
                          <button
                            type="button"
                            className="text-left hover:text-blue-700 hover:underline"
                            onClick={() =>
                              openExplorer(
                                filteredRecords.filter((record) => record.routeLabel === entry.routeLabel),
                                `Analytics · ${entry.routeLabel}`,
                                { search: entry.routeLabel },
                              )
                            }
                          >
                            {entry.routeLabel}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">{entry.records}</TableCell>
                        <TableCell className="text-right">{entry.totalCasualties}</TableCell>
                        <TableCell className="text-right">{entry.verySerious}</TableCell>
                        <TableCell className="text-right">{entry.completeRouteDetails}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card id="vessel-type-incident-type">
              <CardHeader>
                <CardTitle>Vessel Type × Incident Type</CardTitle>
                <CardDescription>
                  Matrix of reported incident records by vessel class and incident type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapGrid
                  columns={incidentTypeKeys}
                  rows={vesselTypeIncidentHeatmap}
                  valueLabel="records"
                  palette="teal"
                  onCellClick={(vesselType, incidentType) => {
                    openExplorer(
                      filteredRecords.filter(
                        (record) => record.vesselTypeClass === vesselType && record.incidentType === incidentType,
                      ),
                      `Analytics · ${vesselType} × ${incidentType}`,
                      { type: incidentType, search: vesselType },
                    );
                  }}
                />
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          <TabsContent value="conditions-causes" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card id="weather-analysis">
              <CardHeader>
                <CardTitle>Weather and Sea Condition Analysis</CardTitle>
                <CardDescription>
                  Recorded weather/sea condition category by severity. Weather context does not prove causation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapGrid
                  columns={weatherColumns}
                  rows={weatherSeverityHeatmap}
                  valueLabel="records"
                  palette="amber"
                  onCellClick={(weatherCategory, severity) => {
                    openExplorer(
                      filteredRecords.filter(
                        (record) => record.weatherConditionCategory === weatherCategory && record.severityLevel === severity,
                      ),
                      `Analytics · ${weatherCategory} × ${severity}`,
                      { severity },
                    );
                  }}
                />
              </CardContent>
            </Card>

            <Card id="cause-pareto">
              <CardHeader>
                <CardTitle>Cause Factor Ranking</CardTitle>
                <CardDescription>
                  Ranked coded cause categories in the current selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={causePareto} layout="vertical" margin={{ left: 12, right: 16 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} stroke="#64748b" />
                    <YAxis type="category" dataKey="causeCategory" width={170} stroke="#64748b" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="records"
                      name="Record count"
                      fill="#7c3aed"
                      radius={[0, 8, 8, 0]}
                      onClick={(event) => {
                        const causeCategory = event?.causeCategory;
                        openExplorer(
                          filteredRecords.filter((record) => record.causeCategory === causeCategory),
                          `Analytics · ${causeCategory}`,
                          { search: causeCategory },
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}
