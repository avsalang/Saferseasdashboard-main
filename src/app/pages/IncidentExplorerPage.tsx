import { useState } from "react";
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
  TableRow 
} from "../components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
import { Search, Filter, Download, Eye, Edit } from "lucide-react";
import { mockIncidents, Incident } from "../data/mockIncidents";

export function IncidentExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = 
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.province.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity;
    const matchesType = filterType === "all" || incident.type === filterType;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "Very Serious": return "bg-red-500 hover:bg-red-600";
      case "Serious": return "bg-orange-500 hover:bg-orange-600";
      case "Less Serious": return "bg-yellow-500 hover:bg-yellow-600";
      default: return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Published": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-yellow-100 text-yellow-800";
      case "Verified": return "bg-blue-100 text-blue-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Incident Explorer</h1>
        <p className="text-slate-600">Search, filter, and analyze maritime incident reports</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>Complete database of maritime incidents</CardDescription>
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
          {/* Filter Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by ID, vessel name, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Incident Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Collision">Collision</SelectItem>
                <SelectItem value="Grounding">Grounding</SelectItem>
                <SelectItem value="Sinking">Sinking</SelectItem>
                <SelectItem value="Fire/Explosion">Fire/Explosion</SelectItem>
                <SelectItem value="Capsizing">Capsizing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Very Serious">Very Serious</SelectItem>
                <SelectItem value="Serious">Serious</SelectItem>
                <SelectItem value="Less Serious">Less Serious</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-slate-600">
            Showing {filteredIncidents.length} of {mockIncidents.length} incidents
          </div>

          {/* Data Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      {incident.id}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(incident.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {incident.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate text-sm">{incident.vesselName}</div>
                      <div className="text-xs text-slate-500">{incident.vesselType}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {incident.location.port}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getSeverityBadgeColor(incident.severity)} text-white border-0`}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {incident.authority}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(incident.status)}`}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[600px] overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle>Incident Details</SheetTitle>
                            <SheetDescription>{incident.id}</SheetDescription>
                          </SheetHeader>
                          
                          <div className="mt-6 space-y-6">
                            {/* Summary Panel */}
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={`${getSeverityBadgeColor(incident.severity)} text-white border-0`}>
                                  {incident.severity}
                                </Badge>
                                <Badge variant="outline">{incident.type}</Badge>
                                <Badge variant="outline" className={getStatusBadgeColor(incident.status)}>
                                  {incident.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-600">
                                {incident.location.port}, {incident.location.province}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(incident.date).toLocaleString()}
                              </div>
                            </div>

                            {/* Tabbed Details */}
                            <Tabs defaultValue="overview">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="vessel">Vessel</TabsTrigger>
                                <TabsTrigger value="environment">Environment</TabsTrigger>
                                <TabsTrigger value="crew">Crew</TabsTrigger>
                              </TabsList>

                              <TabsContent value="overview" className="space-y-4 pt-4">
                                <div>
                                  <h4 className="text-sm text-slate-700 mb-2">Narrative</h4>
                                  <p className="text-sm text-slate-900">{incident.narrative}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Casualty Type</div>
                                    <div className="text-sm text-slate-900">{incident.casualtyType}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Authority</div>
                                    <div className="text-sm text-slate-900">{incident.authority}</div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="vessel" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Vessel Name</div>
                                    <div className="text-sm text-slate-900">{incident.vesselName}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Vessel Type</div>
                                    <div className="text-sm text-slate-900">{incident.vesselType}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Flag State</div>
                                    <div className="text-sm text-slate-900">{incident.flagState}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Status</div>
                                    <div className="text-sm text-slate-900">{incident.status}</div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="environment" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Wave Height</div>
                                    <div className="text-sm text-slate-900">{incident.weather.waveHeight}m</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Wind Force</div>
                                    <div className="text-sm text-slate-900">{incident.weather.windForce} Beaufort</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Visibility</div>
                                    <div className="text-sm text-slate-900">{incident.weather.visibility}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Location</div>
                                    <div className="text-sm text-slate-900">
                                      {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="crew" className="space-y-4 pt-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Crew Count</div>
                                    <div className="text-2xl text-slate-900">{incident.crewCount}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Passengers</div>
                                    <div className="text-2xl text-slate-900">{incident.passengerCount}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Total Onboard</div>
                                    <div className="text-2xl text-slate-900">
                                      {incident.crewCount + incident.passengerCount}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Fatalities</div>
                                      <div className="text-2xl text-red-600">{incident.fatalities}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">Injuries</div>
                                      <div className="text-2xl text-orange-600">{incident.injuries}</div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>

                            <div className="pt-4 border-t flex gap-2">
                              <Button className="flex-1 gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Report
                              </Button>
                              <Button variant="outline" className="flex-1 gap-2">
                                <Download className="w-4 h-4" />
                                Export
                              </Button>
                            </div>
                          </div>
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
