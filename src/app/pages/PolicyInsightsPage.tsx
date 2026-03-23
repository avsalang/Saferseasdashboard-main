import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FileText, Download, AlertTriangle, TrendingUp, MapPin, Calendar } from "lucide-react";

export function PolicyInsightsPage() {
  const riskFactors = [
    {
      title: "Collision Risk in Manila Bay",
      severity: "High",
      trend: "Increasing",
      description: "30% increase in near-miss collisions during Q1 2026. Primary factors: high vessel traffic density and reduced visibility during monsoon season.",
      recommendations: [
        "Enhanced AIS monitoring in high-traffic zones",
        "Mandatory VTS communication protocols",
        "Weather-based traffic management"
      ],
      affectedVessels: 1247,
      region: "Manila Bay"
    },
    {
      title: "Fishing Vessel Safety Concerns",
      severity: "High",
      trend: "Stable",
      description: "Fishing vessels account for 29% of all incidents, with higher fatality rates. Issues include inadequate safety equipment and crew training gaps.",
      recommendations: [
        "Mandatory safety equipment audits",
        "Subsidized life jacket programs",
        "Enhanced weather monitoring access"
      ],
      affectedVessels: 3842,
      region: "National"
    },
    {
      title: "Aging Ferry Fleet Risk",
      severity: "Medium",
      trend: "Increasing",
      description: "Vessels over 25 years show 2.3x higher incident rates. Machinery failures and structural issues are primary concerns.",
      recommendations: [
        "Accelerated vessel replacement program",
        "Enhanced periodic maintenance requirements",
        "Annual structural integrity assessments"
      ],
      affectedVessels: 289,
      region: "Visayas Region"
    }
  ];

  const seasonalTrends = [
    {
      period: "Typhoon Season (June-November)",
      impact: "Very High",
      incidents: 187,
      primaryRisks: "Capsizing, Sinking, Weather-related machinery failure",
      mitigationStatus: "Active monitoring protocols in place"
    },
    {
      period: "Northeast Monsoon (December-February)",
      impact: "High",
      incidents: 142,
      primaryRisks: "Rough seas, reduced visibility, grounding",
      mitigationStatus: "Enhanced weather advisory system"
    },
    {
      period: "Southwest Monsoon (June-September)",
      impact: "Medium",
      incidents: 98,
      primaryRisks: "Flooding, cargo shifting, navigation challenges",
      mitigationStatus: "Route optimization recommendations"
    }
  ];

  const highRiskRegions = [
    { name: "Manila Bay", incidents: 89, riskScore: 9.2, primaryConcern: "High traffic density" },
    { name: "Visayan Sea", incidents: 67, riskScore: 7.8, primaryConcern: "Weather exposure" },
    { name: "Mindoro Strait", incidents: 54, riskScore: 7.5, primaryConcern: "Strong currents" },
    { name: "Sibuyan Sea", incidents: 43, riskScore: 6.9, primaryConcern: "Fishing conflicts" }
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Policy Insights</h1>
        <p className="text-slate-600">Data-driven policy recommendations and safety improvement initiatives</p>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3 mb-6">
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Full Report (PDF)
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Data (CSV)
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Briefing Note
        </Button>
      </div>

      <div className="space-y-6">
        {/* Risk Factors */}
        <div>
          <h2 className="text-xl text-slate-900 mb-4">Critical Risk Factors</h2>
          <div className="space-y-4">
            {riskFactors.map((factor, index) => (
              <Card key={index} className="border-l-4" style={{
                borderLeftColor: factor.severity === "High" ? "#ef4444" : "#f59e0b"
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{factor.title}</CardTitle>
                        <Badge className={
                          factor.severity === "High" 
                            ? "bg-red-500 text-white" 
                            : "bg-yellow-500 text-white"
                        }>
                          {factor.severity} Risk
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {factor.trend}
                        </Badge>
                      </div>
                      <CardDescription>{factor.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{factor.region}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <strong>{factor.affectedVessels.toLocaleString()}</strong> vessels affected
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-slate-700 mb-2">Policy Recommendations:</h4>
                    <ul className="space-y-1">
                      {factor.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Seasonal Trends */}
        <div>
          <h2 className="text-xl text-slate-900 mb-4">Seasonal Trends & Patterns</h2>
          <div className="grid grid-cols-3 gap-4">
            {seasonalTrends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <CardTitle className="text-base">{trend.period}</CardTitle>
                  </div>
                  <Badge className={
                    trend.impact === "Very High" 
                      ? "bg-red-500 w-fit" 
                      : trend.impact === "High"
                      ? "bg-orange-500 w-fit"
                      : "bg-yellow-500 w-fit"
                  }>
                    {trend.impact} Impact
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl text-blue-600 mb-1">{trend.incidents}</div>
                    <div className="text-xs text-slate-500">Historical incidents</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Primary Risks</div>
                    <div className="text-sm text-slate-700">{trend.primaryRisks}</div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-slate-500 mb-1">Mitigation Status</div>
                    <div className="text-sm text-green-700">{trend.mitigationStatus}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* High-Risk Regions */}
        <div>
          <h2 className="text-xl text-slate-900 mb-4">High-Risk Regions</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {highRiskRegions.map((region, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base text-slate-900">{region.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {region.incidents} incidents
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{region.primaryConcern}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-red-600 mb-1">{region.riskScore}</div>
                      <div className="text-xs text-slate-500">Risk Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <CardTitle>Immediate Action Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                  1
                </div>
                <div>
                  <div className="text-sm text-slate-900 mb-1">Enhanced Monitoring - Manila Bay</div>
                  <div className="text-sm text-slate-600">Deploy additional VTS coverage and AIS monitoring in high-density traffic areas</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                  2
                </div>
                <div>
                  <div className="text-sm text-slate-900 mb-1">Fishing Vessel Safety Campaign</div>
                  <div className="text-sm text-slate-600">Launch national safety equipment audit and training program for fishing fleet</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                  3
                </div>
                <div>
                  <div className="text-sm text-slate-900 mb-1">Aging Fleet Assessment</div>
                  <div className="text-sm text-slate-600">Conduct comprehensive structural inspections of vessels over 20 years old</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
