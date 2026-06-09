import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { analyticsSummary, dataCompleteness } from "../data/incidentInsights";

const routeDetailsMetric = dataCompleteness.find((metric) => metric.label === "Voyage and route details");

export function LandingPage() {
  const features = [
    {
      title: "Structured Incident Reporting",
      description: "Nine-step intake flow for recording incident, vessel, voyage, impact, and supporting document details.",
    },
    {
      title: "Record Review",
      description: "Searchable incident records with standardized fields for follow-up review and case comparison.",
    },
    {
      title: "Summary Analytics",
      description: "Descriptive charts for time, type, severity, location, and field-completeness trends.",
    },
    {
      title: "Policy Review Support",
      description: "Working review notes that stay tied to the data currently captured in the mockup.",
    },
  ];

  const stats = [
    { label: "Incident Records", value: analyticsSummary.totalIncidents },
    { label: "Reporting Authorities", value: analyticsSummary.authoritiesRepresented },
    { label: "Route Details Captured", value: `${routeDetailsMetric?.percentage ?? 0}%` },
    { label: "Linked Evidence Coverage", value: `${analyticsSummary.linkedEvidenceCoverage}%` },
  ];

  return (
    <div className="min-h-full">
      <section
        className="relative overflow-hidden text-white px-6 py-24 md:py-32"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8, 34, 94, 0.76), rgba(10, 57, 102, 0.72)), url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/35 via-blue-900/15 to-cyan-950/35" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-6 md:space-y-7">
            <h1 className="text-4xl md:text-6xl tracking-tight font-semibold">
              SAFERSEAS
            </h1>
            <p className="text-base md:text-xl text-cyan-100/95 max-w-4xl mx-auto leading-relaxed">
              System for Analysis, Forensics, Evaluation, and Reporting for Incidents at Sea
            </p>
            <p className="text-2xl md:text-4xl text-blue-50 max-w-4xl mx-auto leading-tight font-medium">
              Standardized Maritime Incident Reporting and Analytics Platform
            </p>
            <p className="text-base md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              A government platform for structured incident reporting, historical review, and analytics
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/submit-incident">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 min-w-56">
                  Submit Incident Report
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white/80 bg-white/5 text-white hover:bg-white/15 hover:text-white px-8 min-w-44 shadow-sm backdrop-blur-sm">
                  View Dashboard
                </Button>
              </Link>
              <Link to="/incident-explorer">
                <Button size="lg" variant="outline" className="border-white/80 bg-white/5 text-white hover:bg-white/15 hover:text-white px-8 min-w-52 shadow-sm backdrop-blur-sm">
                  Access Data Explorer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl text-blue-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-slate-900 mb-3">Platform Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Core workflows for incident intake, record review, mapping, and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-200 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-slate-900 mb-3">Current Capabilities</h2>
            <p className="text-lg text-slate-600">
              Tools for reporting, reviewing, and analyzing maritime incident records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GIS Mapping</CardTitle>
                <CardDescription>
                  Coordinate-based map review with density, clusters, and individual incident points.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/gis-map">
                  <Button variant="outline" className="w-full">Explore Map</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Descriptive summaries for time, type, severity, province, and capture completeness.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/analytics">
                  <Button variant="outline" className="w-full">View Analytics</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Review</CardTitle>
                <CardDescription>
                  Structured review priorities and supporting record summaries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/policy-insights">
                  <Button variant="outline" className="w-full">Open Notes</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl">Ready to review the mockup?</h2>
          <p className="text-xl text-blue-100">
            Explore how standardized incident records can support review, mapping, and descriptive analysis
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/submit-incident">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/policy-insights">
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
                View Review Notes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
