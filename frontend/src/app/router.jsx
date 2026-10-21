import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RootLayout from "@/components/layout/RootLayout";
import SiteLayout from "@/components/layout/SiteLayout";
import RequireAuth from "@/features/auth/components/RequireAuth";
import HomePage from "@/features/home/pages/HomePage";
import { ROLES } from "@/lib/constants";
import LegacyJobRedirect from "@/pages/LegacyJobRedirect";
import NotFoundPage from "@/pages/NotFoundPage";
import RouteErrorPage from "@/pages/RouteErrorPage";

// Loads a page only when its route is visited, keeping the initial bundle small
const lazyPage = (load) => async () => ({ Component: (await load()).default });

const JobsPage = lazyPage(() => import("@/features/jobs/pages/JobsPage"));
const JobDetailsPage = lazyPage(() => import("@/features/jobs/pages/JobDetailsPage"));
const CompaniesDirectoryPage = lazyPage(() => import("@/features/companies/pages/CompaniesDirectoryPage"));
const CompanyProfilePage = lazyPage(() => import("@/features/companies/pages/CompanyProfilePage"));
const LoginPage = lazyPage(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazyPage(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazyPage(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazyPage(() => import("@/features/auth/pages/ResetPasswordPage"));
const VerifyEmailPage = lazyPage(() => import("@/features/auth/pages/VerifyEmailPage"));
const NotificationsPage = lazyPage(() => import("@/features/notifications/pages/NotificationsPage"));
const MyApplicationsPage = lazyPage(() => import("@/features/applications/pages/MyApplicationsPage"));
const ApplicationDetailPage = lazyPage(() => import("@/features/applications/pages/ApplicationDetailPage"));
const SavedJobsPage = lazyPage(() => import("@/features/savedJobs/pages/SavedJobsPage"));
const ProfilePage = lazyPage(() => import("@/features/profile/pages/ProfilePage"));
const AccountPage = lazyPage(() => import("@/features/profile/pages/AccountPage"));
const RecruiterJobsPage = lazyPage(() => import("@/features/jobs/pages/RecruiterJobsPage"));
const PostJobPage = lazyPage(() => import("@/features/jobs/pages/PostJobPage"));
const JobApplicantsPage = lazyPage(() => import("@/features/applications/pages/JobApplicantsPage"));
const RecruiterOverviewPage = lazyPage(() => import("@/features/dashboard/pages/RecruiterOverviewPage"));
const EditJobPage = lazyPage(() => import("@/features/jobs/pages/EditJobPage"));
const RecruiterApplicationPage = lazyPage(() => import("@/features/applications/pages/RecruiterApplicationPage"));
const CompaniesPage = lazyPage(() => import("@/features/companies/pages/CompaniesPage"));
const CompanyFormPage = lazyPage(() => import("@/features/companies/pages/CompanyFormPage"));
const AdminOverviewPage = lazyPage(() => import("@/features/admin/pages/AdminOverviewPage"));
const AdminUsersPage = lazyPage(() => import("@/features/admin/pages/AdminUsersPage"));
const AdminCompaniesPage = lazyPage(() => import("@/features/admin/pages/AdminCompaniesPage"));
const AdminJobsPage = lazyPage(() => import("@/features/admin/pages/AdminJobsPage"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/jobs", lazy: JobsPage },
          { path: "/jobs/:id", lazy: JobDetailsPage },
          { path: "/companies", lazy: CompaniesDirectoryPage },
          { path: "/companies/:slug", lazy: CompanyProfilePage },
          { path: "/verify-email", lazy: VerifyEmailPage },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", lazy: LoginPage },
          { path: "/register", lazy: RegisterPage },
          { path: "/forgot-password", lazy: ForgotPasswordPage },
          { path: "/reset-password", lazy: ResetPasswordPage },
        ],
      },
      {
        element: <RequireAuth roles={[ROLES.CANDIDATE]} />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Navigate to="applications" replace /> },
              { path: "applications", lazy: MyApplicationsPage },
              { path: "applications/:id", lazy: ApplicationDetailPage },
              { path: "saved", lazy: SavedJobsPage },
              { path: "profile", lazy: ProfilePage },
              { path: "notifications", lazy: NotificationsPage },
              { path: "account", lazy: AccountPage },
            ],
          },
        ],
      },
      {
        element: <RequireAuth roles={[ROLES.RECRUITER]} />,
        children: [
          {
            path: "/recruiter",
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: "overview", lazy: RecruiterOverviewPage },
              { path: "jobs", lazy: RecruiterJobsPage },
              { path: "jobs/new", lazy: PostJobPage },
              { path: "jobs/:id/edit", lazy: EditJobPage },
              { path: "jobs/:jobId/applicants", lazy: JobApplicantsPage },
              { path: "applications/:id", lazy: RecruiterApplicationPage },
              { path: "companies", lazy: CompaniesPage },
              { path: "companies/new", lazy: CompanyFormPage },
              { path: "companies/:id/edit", lazy: CompanyFormPage },
              { path: "notifications", lazy: NotificationsPage },
              { path: "account", lazy: AccountPage },
            ],
          },
        ],
      },
      {
        element: <RequireAuth roles={[ROLES.ADMIN]} />,
        children: [
          {
            path: "/admin",
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: "overview", lazy: AdminOverviewPage },
              { path: "users", lazy: AdminUsersPage },
              { path: "companies", lazy: AdminCompaniesPage },
              { path: "jobs", lazy: AdminJobsPage },
              { path: "notifications", lazy: NotificationsPage },
              { path: "account", lazy: AccountPage },
            ],
          },
        ],
      },
      // Links from the previous version of the site
      { path: "/browse", element: <Navigate to="/jobs" replace /> },
      { path: "/description/:id", element: <LegacyJobRedirect /> },
      { path: "/signup", element: <Navigate to="/register" replace /> },
      { path: "/profile", element: <Navigate to="/dashboard/profile" replace /> },
      {
        element: <SiteLayout />,
        children: [{ path: "*", element: <NotFoundPage /> }],
      },
    ],
  },
]);
