import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Download } from "lucide-react";
import { incidentRecords, EnrichedIncident, getSeverityColor } from "../data/incidentInsights";

export function IncidentExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<EnrichedIncident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterAuthority, setFilterAuthority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const drilldownIds = useMemo(() => new Set(searchParams.getAll("id")), [searchParams]);
  const drilldownContext = searchParams.get("context");

  useEffect(() => {
    setSearchTerm(searchParams.get("search") ?? "");
    setFilterType(searchParams.get("type") ?? "all");
    setFilterSeverity(searchParams.get("severity") ?? "all");
    setFilterProvince(searchParams.get("province") ?? "all");
    setFilterAuthority(searchParams.get("authority") ?? "all");
    setFilterStatus(searchParams.get("status") ?? "all");
  }, [searchParams]);

  const baseIncidents = useMemo(() => {
    if (!drilldownIds.size) {
      return incidentRecords;
    }

    return incidentRecords.filter((incident) => drilldownIds.has(incident.id));
  }, [drilldownIds]);

  const authorities = Array.from(new Set(baseIncidents.map((incident) => incident.authority))).sort((left, right) => left.localeCompare(right));
  const statuses = Array.from(new Set(baseIncidents.map((incident) => incident.status))).sort((left, right) => left.localeCompare(right));
  const types = Array.from(new Set(baseIncidents.map((incident) => incident.type))).sort((left, right) => left.localeCompare(right));
  const provinces = Array.from(new Set(baseIncidents.map((incident) => incident.location.province))).sort((left, right) => left.localeCompare(right));

  const filteredIncidents = baseIncidents.filter((incident) => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.primaryCauseResolved.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity;
    const matchesType = filterType === "all" || incident.type === filterType;
    const matchesProvince = filterProvince === "all" || incident.location.province === filterProvince;
    const matchesAuthority = filterAuthority === "all" || incident.authority === filterAuthority;
    const matchesStatus = filterStatus === "all" || incident.status === filterStatus;

    return matchesSearch && matchesSeverity && matchesType && matchesProvince && matchesAuthority && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Verified":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Incident Explorer</h1>
        <p className="text-slate-600">Search, filter, and review standardized maritime incident records</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Incident Records</CardTitle>
              <CardDescription>Queryable catalogue of historical maritime incident reports</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {drilldownIds.size > 0 && (
            <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-medium">{drilldownContext ?? "Drill-down selection"}</div>
                <div>{baseIncidents.length} records were passed from another view. You can refine this subset further below.</div>
              </div>
              <Button variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>
                Clear drill-down
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_180px_180px_200px_220px_180px] gap-4">
            <Input
              placeholder="Search by ID, vessel, province, or cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Incident Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Very Serious">Very Serious</SelectItem>
                <SelectItem value="Serious">Serious</SelectItem>
                <SelectItem value="Less Serious">Less Serious</SelectItem>
                <SelectItem value="Near Miss">Near Miss</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProvince} onValueChange={setFilterProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAuthority} onValueChange={setFilterAuthority}>
              <SelectTrigger>
                <SelectValue placeholder="Authority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authorities</SelectItem>
                {authorities.map((authority) => (
                  <SelectItem key={authority} value={authority}>
                    {authority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Showing {filteredIncidents.length} of {baseIncidents.length} incident records</span>
            <span>{filteredIncidents.filter((incident) => incident.status === "Under Review").length} currently under review</span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">{incident.id}</TableCell>
                    <TableCell className="text-sm">{new Date(incident.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate text-sm">{incident.vesselName}</div>
                      <div className="text-xs text-slate-500">{incident.vesselType}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{incident.location.port}</div>
                      <div className="text-xs text-slate-500">{incident.location.province} • {incident.region}</div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[180px]">
                      <span className="line-clamp-2">{incident.primaryCauseResolved}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs text-white border-0"
                        style={{ backgroundColor: getSeverityColor(incident.severity) }}
                      >
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(incident.status)}`}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(incident)}>
                              Open
                            </Button>
                          </SheetTrigger>
                        <SheetContent className="w-[720px] overflow-y-auto">
                          {selectedIncident && (
                            <>
                              <SheetHeader>
                                <SheetTitle>Incident Details</SheetTitle>
                                <SheetDescription>{selectedIncident.id}</SheetDescription>
                              </SheetHeader>

                              <div className="mt-6 space-y-6">
                                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge style={{ backgroundColor: getSeverityColor(selectedIncident.severity), color: "white" }}>
                                      {selectedIncident.severity}
                                    </Badge>
                                    <Badge variant="outline">{selectedIncident.type}</Badge>
                                    <Badge variant="outline" className={getStatusBadgeColor(selectedIncident.status)}>
                                      {selectedIncident.status}
                                    </Badge>
                                    <Badge>{selectedIncident.authority}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                    <div>{selectedIncident.location.port}, {selectedIncident.location.province}</div>
                                    <div>{new Date(selectedIncident.date).toLocaleString()}</div>
                                    <div>Cause: {selectedIncident.primaryCauseResolved}</div>
                                    <div>Route: {selectedIncident.routeLabel}</div>
                                  </div>
                                </div>

                                <Tabs defaultValue="overview">
                                  <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="vessel">Vessel</TabsTrigger>
                                    <TabsTrigger value="operations">Operations</TabsTrigger>
                                    <TabsTrigger value="findings">Findings</TabsTrigger>
                                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="overview" className="space-y-4 pt-4">
                                    <div>
                                      <h4 className="text-sm text-slate-700 mb-2">Narrative</h4>
                                      <p className="text-sm text-slate-900">{selectedIncident.narrative}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Impact Type</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.casualtyType}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Reporting Method</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.reportingMethod ?? "Not specified"}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Region</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.region}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Season</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.season}</div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="vessel" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Vessel Name</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.vesselName}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Vessel Type</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.vesselType}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Flag State</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.flagState}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Estimated Vessel Age</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.vesselAgeYears} years</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">IMO / Official Number</div>
                                        <div className="text-sm text-slate-900">
                                          {selectedIncident.imoNumber ?? selectedIncident.officialNumber ?? "Not captured"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Classification Society</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.classificationSociety ?? "Not captured"}</div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="operations" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Voyage</div>
                                        <div className="text-sm text-slate-900">
                                          {selectedIncident.voyageOrigin ?? "Unknown"} to {selectedIncident.voyageDestination ?? "Unknown"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Intended Route</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.routeLabel}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Cargo Type</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.cargoTypeResolved}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Cargo Quantity</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.cargoQuantity ?? "Not captured"}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Crew / Passengers</div>
                                        <div className="text-sm text-slate-900">
                                          {selectedIncident.crewCount} crew • {selectedIncident.passengerCount} passengers
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Total Onboard</div>
                                        <div className="text-sm text-slate-900">
                                          {selectedIncident.crewCount + selectedIncident.passengerCount}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                      <div className="text-sm text-slate-900 mb-2">Environmental context</div>
                                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                                        <div>Wave Height: {selectedIncident.weather.waveHeight} m</div>
                                        <div>Wind Force: {selectedIncident.weather.windForce} Beaufort</div>
                                        <div>Visibility: {selectedIncident.weather.visibility}</div>
                                        <div>
                                          Coordinates: {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="findings" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Primary Cause</div>
                                        <div className="text-sm text-slate-900">{selectedIncident.primaryCauseResolved}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Fatalities / Injuries</div>
                                        <div className="text-sm text-slate-900">
                                          {selectedIncident.fatalities} fatalities • {selectedIncident.injuries} injuries
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Cause Findings</div>
                                      <div className="text-sm text-slate-900">
                                        {selectedIncident.findingsOfCause ?? "Findings still pending final review."}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Crew Behavior Factors</div>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedIncident.crewBehaviorFactorsResolved.length ? (
                                          selectedIncident.crewBehaviorFactorsResolved.map((factor) => (
                                            <Badge key={factor} variant="outline">{factor}</Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-slate-500">No factors recorded</span>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Damages Incurred</div>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedIncident.damagesIncurred?.length ? (
                                          selectedIncident.damagesIncurred.map((damage) => (
                                            <Badge key={damage} variant="outline">{damage}</Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-slate-500">No damage categories recorded</span>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Recommendations</div>
                                      <div className="text-sm text-slate-900">
                                        {selectedIncident.recommendations ?? "Recommendations to be drafted after review."}
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="evidence" className="space-y-4 pt-4">
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Key Events Timeline</div>
                                      <div className="text-sm text-slate-900">
                                        {selectedIncident.keyEventsTimeline ?? "Timeline not yet recorded."}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Crew Response</div>
                                      <div className="text-sm text-slate-900">
                                        {selectedIncident.crewResponse ?? "Crew response details not yet recorded."}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Linked Documents</div>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedIncident.linkedDocuments?.length ? (
                                          selectedIncident.linkedDocuments.map((document) => (
                                            <Badge key={document}>{document}</Badge>
                                          ))
                                        ) : (
                                          <span className="text-sm text-slate-500">No linked documents listed</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                                      Standardization score: {selectedIncident.standardizationScore}%. This detail view can support verification, GIS review, and policy evidence packaging.
                                    </div>
                                  </TabsContent>
                                </Tabs>

                                <div className="pt-4 border-t flex gap-2">
                                  <Button className="flex-1">Edit Report</Button>
                                  <Button variant="outline" className="flex-1 gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
