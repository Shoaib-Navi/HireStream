import { Bookmark, Briefcase, Building2, FileText, LayoutDashboard, Settings2, UserRound } from "lucide-react";
import { ROLES } from "@/lib/constants";

export const PUBLIC_NAV_LINKS = [
  { label: "Find jobs", to: "/jobs" },
  { label: "Companies", to: "/companies" },
];

// Sidebar items of each role's dashboard
export const DASHBOARD_NAV = {
  [ROLES.CANDIDATE]: [
    { label: "Applications", to: "/dashboard/applications", icon: FileText },
    { label: "Saved jobs", to: "/dashboard/saved", icon: Bookmark },
    { label: "Profile", to: "/dashboard/profile", icon: UserRound },
    { label: "Account", to: "/dashboard/account", icon: Settings2 },
  ],
  [ROLES.RECRUITER]: [
    { label: "Overview", to: "/recruiter/overview", icon: LayoutDashboard },
    { label: "Jobs", to: "/recruiter/jobs", icon: Briefcase },
    { label: "Companies", to: "/recruiter/companies", icon: Building2 },
    { label: "Account", to: "/recruiter/account", icon: Settings2 },
  ],
};

const DASHBOARD_HOME = {
  [ROLES.CANDIDATE]: "/dashboard/applications",
  [ROLES.RECRUITER]: "/recruiter/overview",
};

export const getDashboardHome = (role) => DASHBOARD_HOME[role] ?? "/";
