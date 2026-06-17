import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      {
        path: "dashboard",
        lazy: async () => ({ Component: (await import("./pages/DashboardPage")).DashboardPage }),
      },
      {
        path: "submit-incident",
        lazy: async () => ({ Component: (await import("./pages/SubmitIncidentPage")).SubmitIncidentPage }),
      },
      {
        path: "gis-map",
        lazy: async () => ({ Component: (await import("./pages/GISMapPage")).GISMapPage }),
      },
      {
        path: "analytics",
        lazy: async () => ({ Component: (await import("./pages/AnalyticsPage")).AnalyticsPage }),
      },
      {
        path: "risk-assessment",
        lazy: async () => ({ Component: (await import("./pages/RiskAssessmentPage")).RiskAssessmentPage }),
      },
      {
        path: "incident-explorer",
        lazy: async () => ({ Component: (await import("./pages/IncidentExplorerPage")).IncidentExplorerPage }),
      },
      {
        path: "policy-insights",
        lazy: async () => ({ Component: (await import("./pages/PolicyInsightsPage")).PolicyInsightsPage }),
      },
      {
        path: "profile",
        lazy: async () => ({ Component: (await import("./pages/ProfilePage")).ProfilePage }),
      },
    ],
  },
]);
