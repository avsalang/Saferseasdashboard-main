import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubmitIncidentPage } from "./pages/SubmitIncidentPage";
import { GISMapPage } from "./pages/GISMapPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { IncidentExplorerPage } from "./pages/IncidentExplorerPage";
import { PolicyInsightsPage } from "./pages/PolicyInsightsPage";
import { AdminPortalPage } from "./pages/AdminPortalPage";
import { TrainingPortalPage } from "./pages/TrainingPortalPage";
import { ProfilePage } from "./pages/ProfilePage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "submit-incident", Component: SubmitIncidentPage },
      { path: "gis-map", Component: GISMapPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "incident-explorer", Component: IncidentExplorerPage },
      { path: "policy-insights", Component: PolicyInsightsPage },
      { path: "admin", Component: AdminPortalPage },
      { path: "training", Component: TrainingPortalPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);
