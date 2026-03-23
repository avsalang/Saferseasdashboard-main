import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, Ship, Users, FileText, AlertTriangle } from "lucide-react";
import { mockIncidents } from "../data/mockIncidents";
import { Badge } from "../components/ui/badge";

export function DashboardPage() {
  const recentIncidents = mockIncidents.slice(0, 5);
  
  const stats = [
    {
      title: "Total Incidents (YTD)",
      value: "234",
      change: "+12%",
      trend: "up",
      icon: FileText,
      description: "vs. last year"
    },
    {
      title: "Very Serious Incidents",
      value: "42",
      change: "-8%",
      trend: "down",
      icon: AlertTriangle,
      description: "This quarter"
    },
    {
      title: "Active Vessels",
      value: "15,234",
      change: "+3%",
      trend: "up",
      icon: Ship,
      description: "Registered fleet"
    },
    {
      title: "Casualties",
      value: "87",
      change: "-15%",
      trend: "down",
      icon: Users,
      description: "Fatalities & injuries"
    }
  ];

  const alerts = [
    {
      severity: "high",
      title: "Increased Collision Risk",
      description: "Manila Bay area showing 30% increase in near-miss incidents this week",
      area: "Manila Bay"
    },
    {
      severity: "medium",
      title: "Weather Advisory",
      description: "Tropical depression approaching Visayas region - heightened monitoring",
      area: "Visayas"
    },
    {
      severity: "low",
      title: "Equipment Compliance",
      description: "12 vessels pending AIS equipment certification renewal",
      area: "National"
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50">
      <div>
        <h1 className="text-3xl text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of maritime incident reporting and safety metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <Icon className="w-4 h-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-slate-900 mb-1">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm flex items-center gap-1 ${
                    stat.title.includes("Serious") || stat.title.includes("Casualties")
                      ? (isPositive ? 'text-red-600' : 'text-green-600')
                      : (isPositive ? 'text-green-600' : 'text-red-600')
                  }`}>
                    {stat.title.includes("Serious") || stat.title.includes("Casualties") ? (
                      isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                    ) : (
                      isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-sm text-slate-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts & Recent Incidents */}
      <div className="grid grid-cols-2 gap-6">
        {/* Safety Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Alerts</CardTitle>
            <CardDescription>Active warnings and advisories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-500' :
                  alert.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm text-slate-900">{alert.title}</h4>
                    <Badge variant="outline" className="text-xs">{alert.area}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{alert.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported maritime incidents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  incident.severity === 'Very Serious' ? 'text-red-500' :
                  incident.severity === 'Serious' ? 'text-orange-500' :
                  'text-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-slate-900 truncate">{incident.vesselName}</span>
                    <Badge variant="outline" className="text-xs">{incident.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{incident.id} • {new Date(incident.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-700 line-clamp-1">{incident.narrative}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently accessed reports and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Monthly Summary", count: "Ready" },
              { label: "Pending Reviews", count: "18" },
              { label: "Draft Reports", count: "5" },
              { label: "Export Data", count: "CSV/PDF" }
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 text-left bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="text-2xl text-blue-600 mb-1">{action.count}</div>
                <div className="text-sm text-slate-700">{action.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
