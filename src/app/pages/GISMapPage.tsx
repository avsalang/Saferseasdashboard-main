import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MultiSelectFilter, buildOptions } from "../components/MultiSelectFilter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { MapWrapper } from "../components/MapWrapper";
import { incidentRecords } from "../data/incidentInsights";
import { buildIncidentExplorerPath } from "../analytics/drilldown";

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
};

const quarterOptions = [
  { value: "all", label: "All Quarters" },
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
];

const severityOptionOrder = ["Very Serious", "Serious", "Less Serious", "Near Miss"];
const statusOptionOrder = ["Draft", "Under Review", "Verified", "Published"];

function getQuarter(date: string) {
  const month = new Date(date).getMonth();
  return `Q${Math.floor(month / 3) + 1}`;
}

export function GISMapPage() {
  const navigate = useNavigate();
  const availableYears = Array.from(new Set(incidentRecords.map((incident) => String(incident.year)))).sort();
  const availableTypes = buildOptions(incidentRecords.map((incident) => incident.type));
  const availableSeverities = buildOptions(incidentRecords.map((incident) => incident.severity), severityOptionOrder);
  const availableAuthorities = buildOptions(incidentRecords.map((incident) => incident.authority ?? "Unspecified"));
  const availableProvinces = buildOptions(incidentRecords.map((incident) => incident.location.province));
  const availableVesselTypes = buildOptions(incidentRecords.map((incident) => incident.vesselType));
  const availableReportingMethods = buildOptions(incidentRecords.map((incident) => incident.reportingMethod ?? "Unspecified"));
  const availableStatuses = buildOptions(incidentRecords.map((incident) => incident.status), statusOptionOrder);
  const availableCauses = buildOptions(incidentRecords.map((incident) => incident.primaryCauseResolved));

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(availableTypes);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(availableSeverities);
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>(availableAuthorities);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(availableProvinces);
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>(availableVesselTypes);
  const [selectedReportingMethods, setSelectedReportingMethods] = useState<string[]>(availableReportingMethods);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(availableStatuses);
  const [selectedCauses, setSelectedCauses] = useState<string[]>(availableCauses);
  const [showDensity, setShowDensity] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedQuarter("all");
    setSelectedTypes(availableTypes);
    setSelectedSeverities(availableSeverities);
    setSelectedAuthorities(availableAuthorities);
    setSelectedProvinces(availableProvinces);
    setSelectedVesselTypes(availableVesselTypes);
    setSelectedReportingMethods(availableReportingMethods);
    setSelectedStatuses(availableStatuses);
    setSelectedCauses(availableCauses);
  };

  const filteredIncidents = incidentRecords.filter((incident) => {
    const matchesYear = selectedYear === "all" || String(incident.year) === selectedYear;
    const matchesQuarter = selectedQuarter === "all" || getQuarter(incident.date) === selectedQuarter;
    const matchesType = selectedTypes.includes(incident.type);
    const matchesSeverity = selectedSeverities.includes(incident.severity);
    const matchesAuthority = selectedAuthorities.includes(incident.authority ?? "Unspecified");
    const matchesProvince = selectedProvinces.includes(incident.location.province);
    const matchesVesselType = selectedVesselTypes.includes(incident.vesselType);
    const matchesReportingMethod = selectedReportingMethods.includes(incident.reportingMethod ?? "Unspecified");
    const matchesStatus = selectedStatuses.includes(incident.status);
    const matchesCause = selectedCauses.includes(incident.primaryCauseResolved);

    return (
      matchesYear &&
      matchesQuarter &&
      matchesType &&
      matchesSeverity &&
      matchesAuthority &&
      matchesProvince &&
      matchesVesselType &&
      matchesReportingMethod &&
      matchesStatus &&
      matchesCause
    );
  });

  const filteredTimeline = Array.from(
    filteredIncidents.reduce((map, incident) => {
      const current = map.get(incident.monthKey) ?? {
        month: incident.monthLabel,
        incidents: 0,
      };
      current.incidents += 1;
      map.set(incident.monthKey, current);
      return map;
    }, new Map<string, { month: string; incidents: number }>()),
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);

  const topProvince = Array.from(
    filteredIncidents.reduce((map, incident) => {
      map.set(incident.location.province, (map.get(incident.location.province) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((left, right) => right[1] - left[1])[0];

  const dominantCause = Array.from(
    filteredIncidents.reduce((map, incident) => {
      map.set(incident.primaryCauseResolved, (map.get(incident.primaryCauseResolved) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((left, right) => right[1] - left[1])[0];

  const casualtiesShown = filteredIncidents.reduce((sum, incident) => sum + incident.casualtyCount, 0);
  const routeDetailsShown = filteredIncidents.filter(
    (incident) => incident.voyageCaptured || Boolean(incident.routeLabel && incident.routeLabel !== "Route pending"),
  ).length;
  const linkedEvidenceShown = filteredIncidents.filter((incident) => Boolean(incident.linkedDocuments?.length)).length;

  const openExplorer = (
    matchingRecords: typeof filteredIncidents,
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

  if (!mounted) {
    return (
      <div className="p-8 bg-slate-50 min-h-full">
        <div className="text-center text-slate-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-full space-y-6">
      <div>
        <h1 className="text-3xl text-slate-900 mb-2">GIS Incident Map</h1>
        <p className="text-slate-600">
          Coordinate-based review of submitted incident locations, with route details shown when they are present in the record
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-base">Spatial Filters</CardTitle>
                  <CardDescription>
                    Match the analytics review scope while keeping map-specific cause and density controls
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={resetFilters}>Reset filters</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-600 mb-2">Year</div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-sm text-slate-600 mb-2">Quarter</div>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quarterOptions.map((quarter) => (
                      <SelectItem key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <MultiSelectFilter
                label="Incident Type"
                options={availableTypes}
                selected={selectedTypes}
                onChange={setSelectedTypes}
              />

              <MultiSelectFilter
                label="Severity"
                options={availableSeverities}
                selected={selectedSeverities}
                onChange={setSelectedSeverities}
              />

              <MultiSelectFilter
                label="Province"
                options={availableProvinces}
                selected={selectedProvinces}
                onChange={setSelectedProvinces}
              />

              <MultiSelectFilter
                label="Vessel Type"
                options={availableVesselTypes}
                selected={selectedVesselTypes}
                onChange={setSelectedVesselTypes}
              />

              <MultiSelectFilter
                label="Reporting Channel"
                options={availableReportingMethods}
                selected={selectedReportingMethods}
                onChange={setSelectedReportingMethods}
              />

              <MultiSelectFilter
                label="Authority"
                options={availableAuthorities}
                selected={selectedAuthorities}
                onChange={setSelectedAuthorities}
              />

              <MultiSelectFilter
                label="Review Status"
                options={availableStatuses}
                selected={selectedStatuses}
                onChange={setSelectedStatuses}
              />

              <MultiSelectFilter
                label="Primary Cause"
                options={availableCauses}
                selected={selectedCauses}
                onChange={setSelectedCauses}
              />

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500 mb-1">Current selection</div>
                <div className="text-lg text-slate-900">{filteredIncidents.length} records</div>
                <div className="text-sm text-slate-500">
                  {selectedYear === "all" ? "All years" : selectedYear} · {selectedQuarter === "all" ? "All quarters" : selectedQuarter}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {selectedTypes.length}/{availableTypes.length} types · {selectedSeverities.length}/{availableSeverities.length} severities · {selectedProvinces.length}/{availableProvinces.length} provinces
                </div>
                <div className="text-sm text-slate-500">
                  {selectedVesselTypes.length}/{availableVesselTypes.length} vessel types · {selectedReportingMethods.length}/{availableReportingMethods.length} channels
                </div>
                <div className="text-sm text-slate-500">
                  {selectedAuthorities.length}/{availableAuthorities.length} authorities · {selectedStatuses.length}/{availableStatuses.length} statuses · {selectedCauses.length}/{availableCauses.length} causes
                </div>
              </div>

              {!filteredIncidents.length && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  No records match the current filters. Reset filters or widen one of the selections to continue the spatial review.
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Show hotspot density</div>
                  <Switch checked={showDensity} onCheckedChange={setShowDensity} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spatial Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="text-left rounded-lg border border-transparent px-2 py-1 hover:border-blue-200 hover:bg-blue-50"
                onClick={() => openExplorer(filteredIncidents, "GIS Map · Current spatial selection")}
              >
                <div className="text-2xl text-blue-600">{filteredIncidents.length}</div>
                <div className="text-sm text-slate-600">Incidents shown</div>
              </button>
              <button
                type="button"
                className="text-left rounded-lg border border-transparent px-2 py-1 hover:border-red-200 hover:bg-red-50"
                onClick={() =>
                  openExplorer(
                    filteredIncidents.filter((incident) => incident.casualtyCount > 0),
                    "GIS Map · Cases with fatalities and injuries",
                  )
                }
              >
                <div className="text-2xl text-red-600">{casualtiesShown}</div>
                <div className="text-sm text-slate-600">Fatalities and injuries shown</div>
              </button>
              <button
                type="button"
                className="text-left rounded-lg border border-transparent px-2 py-1 hover:border-cyan-200 hover:bg-cyan-50"
                onClick={() =>
                  openExplorer(
                    filteredIncidents.filter(
                      (incident) => incident.voyageCaptured || Boolean(incident.routeLabel && incident.routeLabel !== "Route pending"),
                    ),
                    "GIS Map · Cases with route details",
                  )
                }
              >
                <div className="text-2xl text-cyan-600">{routeDetailsShown}</div>
                <div className="text-sm text-slate-600">With route details</div>
              </button>
              <button
                type="button"
                className="text-left rounded-lg border border-transparent px-2 py-1 hover:border-violet-200 hover:bg-violet-50"
                onClick={() =>
                  openExplorer(
                    filteredIncidents.filter((incident) => Boolean(incident.linkedDocuments?.length)),
                    "GIS Map · Cases with linked evidence",
                  )
                }
              >
                <div className="text-2xl text-violet-600">{linkedEvidenceShown}</div>
                <div className="text-sm text-slate-600">With linked evidence</div>
              </button>
              <button
                type="button"
                className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-blue-300"
                onClick={() =>
                  topProvince
                    ? openExplorer(
                        filteredIncidents.filter((incident) => incident.location.province === topProvince[0]),
                        `GIS Map · ${topProvince[0]} reported burden`,
                        { province: topProvince[0] },
                      )
                    : undefined
                }
              >
                <div className="text-xs text-slate-500 mb-1">Most reported province</div>
                <div className="text-sm text-slate-900">
                  {topProvince ? `${topProvince[0]} (${topProvince[1]} records)` : "No location signal for current filter"}
                </div>
              </button>
              <button
                type="button"
                className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-blue-300"
                onClick={() =>
                  dominantCause
                    ? openExplorer(
                        filteredIncidents.filter((incident) => incident.primaryCauseResolved === dominantCause[0]),
                        `GIS Map · ${dominantCause[0]} cause`,
                        { search: dominantCause[0] },
                      )
                    : undefined
                }
              >
                <div className="text-xs text-slate-500 mb-1">Dominant cause</div>
                <div className="text-sm text-slate-900">
                  {dominantCause ? `${dominantCause[0]} (${dominantCause[1]} records)` : "No causal signal for current filter"}
                </div>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtered Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={filteredTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis allowDecimals={false} stroke="#64748b" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="incidents"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                    onClick={(event) => {
                      const monthLabel = event?.month;
                      openExplorer(
                        filteredIncidents.filter((incident) => incident.monthLabel === monthLabel),
                        `GIS Map · ${monthLabel} timeline selection`,
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Map Interpretation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Very Serious", color: "bg-red-900" },
                { label: "Serious", color: "bg-red-600" },
                { label: "Less Serious", color: "bg-orange-500" },
                { label: "Near Miss", color: "bg-amber-500" },
              ].map((entry) => (
                <div key={entry.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${entry.color}`} />
                  <span className="text-sm text-slate-700">{entry.label}</span>
                </div>
              ))}
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-950">
                Zoomed out: the red density layer shows where submitted coordinates cluster. Mid zoom: grouped records preserve count without crowding the map. Zoom in past level 10 to inspect individual records. Larger points indicate more fatalities and injuries.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="h-[calc(100vh-14rem)]">
            <CardContent className="p-0 h-full">
              <MapWrapper incidents={filteredIncidents} showDensity={showDensity} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredIncidents.slice(0, 3).map((incident) => (
              <Card key={incident.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{incident.vesselName}</CardTitle>
                    <Badge variant="outline">{incident.severity}</Badge>
                  </div>
                  <CardDescription>{incident.location.port}, {incident.location.province}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-1">
                  <div><strong className="text-slate-800">Route / voyage:</strong> {incident.routeLabel}</div>
                  <div><strong className="text-slate-800">Cause:</strong> {incident.primaryCauseResolved}</div>
                  <div><strong className="text-slate-800">Authority:</strong> {incident.authority}</div>
                  <div><strong className="text-slate-800">Fatalities / Injuries:</strong> {incident.fatalities} / {incident.injuries}</div>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openExplorer(
                          [incident],
                          `GIS Map · ${incident.id}`,
                          {
                            search: incident.id,
                            type: incident.type,
                            severity: incident.severity,
                            authority: incident.authority,
                            status: incident.status,
                            province: incident.location.province,
                          },
                        )
                      }
                    >
                      Open case
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
