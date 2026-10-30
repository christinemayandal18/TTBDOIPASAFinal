import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import ApplicationsDatabase from "./components/ApplicationsDatabase";
import PreProtectionDashboard from "./components/PreProtectionDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminHomePage from "./components/AdminHomePage";
import CHHomePage from "./components/ch/CHHomePage";
import ProsecutionDashboard from "./components/ProsecutionDashboard";
import CompleteCasesDashboard from "./components/CompleteCasesDashboard";
import AllCasesDashboard from "./components/AllCasesDashboard";
import CaseHandlersPage from "./components/CaseHandlersPage";
import SettingsPage from "./components/SettingsPage";
import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import CHPreProtectionDashboard from "./components/ch/CHPreProtectionDashboard";
import CHProsecutionDashboard from "./components/ch/CHProsecutionDashboard";
import CHCompletedCasesDashboard from "./components/ch/CHCompletedCasesDashboard";
import CHAllCasesDashboard from "./components/ch/CHAllCasesDashboard";
import ApplicantHome from "./components/applicant/ApplicantHome";
import ApplicantMyApplications from "./components/applicant/ApplicantMyApplications";
import ApplicantSubmitDisclosure from "./components/applicant/ApplicantSubmitDisclosure";
import ApplicantResources from "./components/applicant/ApplicantResources";

function RootLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/",                             Component: LandingPage },
      { path: "/login",                        Component: () => <Navigate to="/" replace /> },
      // Admin routes
      { path: "/admin/home",                   Component: AdminHomePage },
      { path: "/admin/dashboard",              Component: AdminDashboard },
      { path: "/admin/incoming",               Component: ApplicationsDatabase },
      { path: "/admin/pre-protection",         Component: PreProtectionDashboard },
      { path: "/admin/prosecution",            Component: ProsecutionDashboard },
      { path: "/admin/complete",               Component: CompleteCasesDashboard },
      { path: "/admin/all-cases",              Component: AllCasesDashboard },
      { path: "/admin/royalty",                Component: () => <Navigate to="/admin/home" replace /> },
      { path: "/admin/case-handlers",          Component: CaseHandlersPage },
      { path: "/admin/settings",               Component: SettingsPage },
      // Case Handler routes
      { path: "/handler/home",                 Component: CHHomePage },
      { path: "/handler/pre-protection",       Component: CHPreProtectionDashboard },
      { path: "/handler/prosecution",          Component: CHProsecutionDashboard },
      { path: "/handler/complete",             Component: CHCompletedCasesDashboard },
      { path: "/handler/all-cases",            Component: CHAllCasesDashboard },
      { path: "/handler/royalty",              Component: () => <Navigate to="/handler/home" replace /> },
      { path: "/handler/settings",             Component: SettingsPage },
      // Applicant routes
      { path: "/applicant/home",               Component: ApplicantHome },
      { path: "/applicant/applications",       Component: ApplicantMyApplications },
      { path: "/applicant/projects",           Component: () => <Navigate to="/applicant/applications" replace /> },
      { path: "/applicant/submit",             Component: ApplicantSubmitDisclosure },
      { path: "/applicant/resources",          Component: ApplicantResources },
      { path: "/applicant/settings",           Component: SettingsPage },
    ],
  },
]);
