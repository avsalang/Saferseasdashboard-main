import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { mockIncidents } from "../data/mockIncidents";
import { MapWrapper } from "../components/MapWrapper";

export function GISMapPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesType = selectedType === "all" || incident.type.toLowerCase().includes(selectedType);
    const matchesSeverity = selectedSeverity === "all" || incident.severity === selectedSeverity;
    return matchesType && matchesSeverity;
  });

  if (!mounted) {
    return (
      <div className="p-8 bg-slate-50 min-h-full">
        <div className="text-center text-slate-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">GIS Incident Map</h1>
        <p className="text-slate-600">Interactive geographic visualization of maritime incidents</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Filter Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Incident Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="collision">Collision</SelectItem>
                    <SelectItem value="grounding">Grounding</SelectItem>
                    <SelectItem value="sinking">Sinking</SelectItem>
                    <SelectItem value="fire">Fire/Explosion</SelectItem>
                    <SelectItem value="capsizing">Capsizing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Severity</Label>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="Very Serious">Very Serious</SelectItem>
                    <SelectItem value="Serious">Serious</SelectItem>
                    <SelectItem value="Less Serious">Less Serious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Vessel Class</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vessels</SelectItem>
                    <SelectItem value="ferry">Ferry</SelectItem>
                    <SelectItem value="cargo">Cargo</SelectItem>
                    <SelectItem value="tanker">Tanker</SelectItem>
                    <SelectItem value="fishing">Fishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Region</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="luzon">Luzon</SelectItem>
                    <SelectItem value="visayas">Visayas</SelectItem>
                    <SelectItem value="mindanao">Mindanao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Show Heatmap</Label>
                  <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Severity Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm text-slate-700">Very Serious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-sm text-slate-700">Serious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm text-slate-700">Less Serious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-700">Near Miss</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Map Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-2xl text-blue-600">{filteredIncidents.length}</div>
                <div className="text-sm text-slate-600">Incidents Shown</div>
              </div>
              <div>
                <div className="text-2xl text-red-600">
                  {filteredIncidents.filter(i => i.severity === "Very Serious").length}
                </div>
                <div className="text-sm text-slate-600">Very Serious</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardContent className="p-0 h-full">
              <MapWrapper
                incidents={filteredIncidents}
                showHeatmap={showHeatmap}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}