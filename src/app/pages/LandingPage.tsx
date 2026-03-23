import { Link } from "react-router";
import { FileText, Database, BarChart3, Share2, Shield, Map, Users, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: "Incident Reporting",
      description: "Standardized intake forms for comprehensive maritime incident documentation with 9-step wizard."
    },
    {
      icon: Database,
      title: "Data Standardization & Integration",
      description: "Cross-agency data synchronization ensuring consistency across MARINA, PCG, and other maritime authorities."
    },
    {
      icon: BarChart3,
      title: "Analytical Processing",
      description: "Advanced analytics for trend identification, risk assessment, and pattern recognition in maritime safety."
    },
    {
      icon: Share2,
      title: "Information Dissemination",
      description: "Real-time policy alerts, safety bulletins, and insights distributed to stakeholders and vessel operators."
    }
  ];

  const stats = [
    { label: "Total Incidents Reported", value: "2,547", icon: FileText },
    { label: "Active Vessels Tracked", value: "15,234", icon: Map },
    { label: "Safety Recommendations", value: "892", icon: Shield },
    { label: "Agency Collaborations", value: "12", icon: Users }
  ];

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl tracking-tight">
              SAFERSEAS
            </h1>
            <p className="text-xl text-cyan-100 max-w-4xl mx-auto">
              System for Analysis, Forensics, Evaluation, and Reporting for Incidents at Sea
            </p>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto">
              Standardized Maritime Incident Reporting and Analytics Platform
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              A comprehensive government platform for maritime safety data collection, analysis, and policy development
            </p>
            
            <div className="flex gap-4 justify-center pt-6">
              <Link to="/submit-incident">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8">
                  Submit Incident Report
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
                  View Dashboard
                </Button>
              </Link>
              <Link to="/incident-explorer">
                <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
                  Access Data Explorer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl text-blue-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-slate-900 mb-3">Platform Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools for maritime incident management and safety analysis
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-slate-200 hover:border-blue-300 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-slate-900 mb-3">Key Capabilities</h2>
            <p className="text-lg text-slate-600">
              Advanced tools for maritime safety professionals
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Map className="w-8 h-8 text-blue-600 mb-3" />
                <CardTitle>GIS Mapping</CardTitle>
                <CardDescription>
                  Interactive incident mapping with heatmaps, clustering, and geographic analysis
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
                <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Real-time visualizations of incident trends, vessel analytics, and risk factors
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
                <Shield className="w-8 h-8 text-blue-600 mb-3" />
                <CardTitle>Policy Insights</CardTitle>
                <CardDescription>
                  Data-driven policy recommendations and safety improvement initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/policy-insights">
                  <Button variant="outline" className="w-full">Access Insights</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl">Ready to improve maritime safety?</h2>
          <p className="text-xl text-blue-100">
            Join MARINA, PCG, and other agencies in creating a safer maritime environment
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/submit-incident">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/training">
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-8">
                View Training
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
