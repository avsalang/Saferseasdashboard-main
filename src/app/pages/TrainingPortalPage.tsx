import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { PlayCircle, FileText, Download, CheckCircle, Lock, Award } from "lucide-react";

export function TrainingPortalPage() {
  const videoTutorials = [
    {
      title: "Getting Started with SAFERSEAS",
      duration: "12:30",
      description: "Introduction to the platform and basic navigation",
      completed: true,
      category: "Beginner"
    },
    {
      title: "Submitting an Incident Report",
      duration: "18:45",
      description: "Step-by-step guide through the 9-step reporting wizard",
      completed: true,
      category: "Beginner"
    },
    {
      title: "Using the GIS Map Interface",
      duration: "15:20",
      description: "Navigate and analyze incidents using geographic visualization",
      completed: false,
      category: "Intermediate"
    },
    {
      title: "Analytics Dashboard Deep Dive",
      duration: "22:15",
      description: "Understanding trends and generating insights from data",
      completed: false,
      category: "Intermediate"
    },
    {
      title: "Advanced Search and Filtering",
      duration: "10:30",
      description: "Power user techniques for incident exploration",
      completed: false,
      category: "Advanced"
    },
    {
      title: "Admin Portal Configuration",
      duration: "25:00",
      description: "User management, workflows, and system settings",
      completed: false,
      category: "Advanced"
    }
  ];

  const manuals = [
    {
      title: "User Guide - Complete Manual",
      pages: 78,
      version: "v1.2",
      updated: "March 2026",
      description: "Comprehensive documentation for all platform features"
    },
    {
      title: "Incident Classification Guide",
      pages: 24,
      version: "v2.0",
      updated: "February 2026",
      description: "Standards for categorizing maritime incidents"
    },
    {
      title: "Data Entry Best Practices",
      pages: 16,
      version: "v1.1",
      updated: "January 2026",
      description: "Guidelines for accurate and complete reporting"
    },
    {
      title: "API Integration Documentation",
      pages: 45,
      version: "v1.0",
      updated: "March 2026",
      description: "Technical guide for system integrations"
    }
  ];

  const certifications = [
    {
      name: "SAFERSEAS Certified Reporter",
      description: "Complete basic training and submit 5 verified reports",
      progress: 80,
      status: "In Progress",
      requirements: ["Complete beginner tutorials", "Pass assessment quiz", "Submit 5 reports"]
    },
    {
      name: "Data Analyst Certification",
      description: "Master analytics tools and interpretation",
      progress: 45,
      status: "In Progress",
      requirements: ["Complete intermediate tutorials", "Analytics quiz (80%+)", "Case study analysis"]
    },
    {
      name: "System Administrator",
      description: "Advanced administration and configuration",
      progress: 0,
      status: "Locked",
      requirements: ["Administrator role required", "Complete all tutorials", "Pass admin exam"]
    }
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Training Portal</h1>
        <p className="text-slate-600">Learn how to effectively use the SAFERSEAS platform</p>
      </div>

      {/* Learning Progress Overview */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tutorials Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-600 mb-1">2/6</div>
            <Progress value={33} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600 mb-1">0</div>
            <div className="text-xs text-slate-500">2 in progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Learning Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-purple-600 mb-1">2.5h</div>
            <div className="text-xs text-slate-500">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quiz Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-orange-600 mb-1">85%</div>
            <div className="text-xs text-slate-500">Average</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Video Tutorials */}
        <div>
          <h2 className="text-xl text-slate-900 mb-4">Video Tutorials</h2>
          <div className="grid grid-cols-2 gap-4">
            {videoTutorials.map((video, index) => (
              <Card key={index} className={video.completed ? "border-green-200 bg-green-50/30" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{video.title}</CardTitle>
                        {video.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                      <CardDescription>{video.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant={
                        video.category === "Beginner" ? "default" :
                        video.category === "Intermediate" ? "secondary" :
                        "outline"
                      }>
                        {video.category}
                      </Badge>
                      <span className="text-sm text-slate-600">{video.duration}</span>
                    </div>
                    <Button size="sm" variant={video.completed ? "outline" : "default"} className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      {video.completed ? "Watch Again" : "Watch Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Manuals */}
        <div>
          <h2 className="text-xl text-slate-900 mb-4">User Manuals & Documentation</h2>
          <div className="grid grid-cols-2 gap-4">
            {manuals.map((manual, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-base">{manual.title}</CardTitle>
                  </div>
                  <CardDescription>{manual.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span>{manual.pages} pages</span>
                      <span>•</span>
                      <span>{manual.version}</span>
                      <span>•</span>
                      <span>{manual.updated}</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Certification Tracking */}
        <div>
          <h2 className="text-xl text-slate-900 mb-4">Certification Programs</h2>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <Card key={index} className={cert.status === "Locked" ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{cert.name}</CardTitle>
                        {cert.status === "Locked" && <Lock className="w-4 h-4 text-slate-400" />}
                        {cert.status === "Completed" && <Award className="w-5 h-5 text-yellow-500" />}
                      </div>
                      <CardDescription>{cert.description}</CardDescription>
                    </div>
                    <Badge variant={
                      cert.status === "Completed" ? "default" :
                      cert.status === "In Progress" ? "secondary" :
                      "outline"
                    }>
                      {cert.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cert.status !== "Locked" && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Progress</span>
                        <span className="text-slate-900">{cert.progress}%</span>
                      </div>
                      <Progress value={cert.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-slate-700 mb-2">Requirements:</div>
                    <ul className="space-y-1">
                      {cert.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {cert.status === "In Progress" && (
                    <Button className="w-full">Continue Learning</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sandbox Dataset */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Practice Environment</CardTitle>
            </div>
            <CardDescription>
              Use our sandbox environment with sample data to practice reporting and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button>Launch Sandbox</Button>
              <Button variant="outline">View Sample Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
