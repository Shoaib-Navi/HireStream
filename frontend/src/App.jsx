import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Home from "./components/Home page/Home";
import Jobs from "./components/Jobs";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import JobDescription from "./components/JobDescription";
import Companies from "./components/admin/Companies";
import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import PostJob from "./components/admin/PostJob";
import AdminJobs from "./components/admin/AdminJobs";
import Applicants from "./components/admin/Applicants";
import Layout from "./components/shared/Layout";
import SiteLayout from "./components/shared/SiteLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import NotFound from "./components/shared/NotFound";
import RouteError from "./components/shared/RouteError";

const appRouter = createBrowserRouter([
  {
    // Navbar, chatbot, scroll reset and session check for every page
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        // Public site pages with the footer
        element: <SiteLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/jobs", element: <Jobs /> },
          { path: "/browse", element: <Browse /> },
          { path: "/description/:id", element: <JobDescription /> },
          {
            element: <ProtectedRoute roles={["student"]} />,
            children: [{ path: "/profile", element: <Profile /> }],
          },
        ],
      },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      {
        // Recruiter area
        path: "/admin",
        element: <ProtectedRoute roles={["recruiter"]} />,
        children: [
          { index: true, element: <Navigate to="/admin/companies" replace /> },
          { path: "companies", element: <Companies /> },
          { path: "companies/create", element: <CompanyCreate /> },
          { path: "companies/:id", element: <CompanySetup /> },
          { path: "jobs", element: <AdminJobs /> },
          { path: "jobs/create", element: <PostJob /> },
          { path: "jobs/:id/applicants", element: <Applicants /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;
