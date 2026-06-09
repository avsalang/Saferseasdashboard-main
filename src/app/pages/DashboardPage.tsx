import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  analyticsSummary,
  dataCompleteness,
  incidentRecords,
  incidentTypeBreakdown,
  provinceBreakdown,
  statusBreakdown,
} from "../data/incidentInsights";

const overviewStats = [
  {
    title: "Incident Records",
    value: analyticsSummary.totalIncidents,
    description: "Historical records currently available",
    accent: "text-blue-600",
  },
  {
    title: "Fatalities and Injuries",
    value: analyticsSummary.fatalities + analyticsSummary.injuries,
    description: `${analyticsSummary.fatalities} fatalities and ${analyticsSummary.injuries} injuries`,
    accent: "text-red-600",
  },
  {
    title: "Reporting Authorities",
    value: analyticsSummary.authoritiesRepresented,
    description: "Authorities represented in submitted records",
    accent: "text-cyan-600",
  },
  {
    title: "Linked Evidence",
    value: `${analyticsSummary.linkedEvidenceCoverage}%`,
    description: `${analyticsSummary.evidenceLinkedRecords} records cite supporting attachments`,
    accent: "text-violet-600",
  },
];

export function DashboardPage() {
  const recentIncidents = incidentRecords.slice(0, 5);
  const topTypes = incidentTypeBreakdown.slice(0, 3);
  const topProvinces = provinceBreakdown.slice(0, 3);
  const workflowSnapshot = statusBreakdown.slice(0, 4);
  const routeMetric = dataCompleteness.find((metric) => metric.label === "Voyage and route details");
  const findingsMetric = dataCompleteness.find((metric) => metric.label === "Cause findings");

  return (
    <div className="p-8 space-y-8 bg-slate-50">
      <div>
        <h1 className="text-3xl text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Overview of submitted incidents, reporting coverage, and current review workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl mb-1 ${stat.accent}`}>{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Record Highlights</CardTitle>
            <CardDescription>Top descriptive signals from the current incident set</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500 mb-2">Most reported incident types</div>
              <div className="space-y-2">
                {topTypes.map((entry) => (
                  <div key={entry.type} className="flex items-center justify-between gap-4 text-sm">
                    <div className="text-slate-900">{entry.type}</div>
                    <div className="text-slate-500">{entry.count} records</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500 mb-2">Most reported provinces</div>
              <div className="space-y-2">
                {topProvinces.map((entry) => (
                  <div key={entry.province} className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <div className="text-slate-900">{entry.province}</div>
                      <div className="text-xs text-slate-500">{entry.region}</div>
                    </div>
                    <div className="text-slate-500">{entry.incidents} records</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="text-xs text-slate-500 mb-1">Route details documented</div>
                <div className="text-2xl text-slate-900">{routeMetric?.percentage ?? 0}%</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="text-xs text-slate-500 mb-1">Cause findings documented</div>
                <div className="text-2xl text-slate-900">{findingsMetric?.percentage ?? 0}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Capture Coverage</CardTitle>
            <CardDescription>Main field groups used for reporting and review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataCompleteness.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="text-slate-900">{metric.label}</div>
                    <div className="text-slate-500">{metric.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900">{metric.captured}/{metric.total}</div>
                    <div className="text-xs text-slate-500">{metric.percentage}%</div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${metric.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Incident Records</CardTitle>
            <CardDescription>Most recent submissions available for review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-slate-900 truncate">{incident.vesselName}</span>
                  <Badge variant="outline" className="text-xs">{incident.type}</Badge>
                  <Badge variant="outline" className="text-xs">{incident.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  {incident.id} • {new Date(incident.date).toLocaleDateString()} • {incident.location.port}, {incident.location.province}
                </p>
                <p className="text-sm text-slate-700 line-clamp-2">{incident.narrative}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Snapshot</CardTitle>
            <CardDescription>Current status of records in the review pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflowSnapshot.map((entry) => (
              <div key={entry.status} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm text-slate-900">{entry.status}</div>
                  <div className="text-xs text-slate-500">{entry.percentage}% of current records</div>
                </div>
                <div className="text-xl text-slate-900">{entry.count}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
