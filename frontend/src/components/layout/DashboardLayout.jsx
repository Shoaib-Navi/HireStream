import { NavLink, Outlet } from "react-router-dom";
import { DASHBOARD_NAV } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";

// Candidate and recruiter areas: role-specific sidebar (tabs on small screens) next to the page
const DashboardLayout = () => {
  const { user } = useAuth();
  const items = DASHBOARD_NAV[user?.role] ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <div className="page-container flex flex-1 gap-8 py-6 lg:py-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="Dashboard" className="sticky top-24 space-y-1">
            {items.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
                    isActive && "bg-card text-primary shadow-card",
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main id="main" className="min-w-0 flex-1">
          <nav aria-label="Dashboard" className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 pb-1 lg:hidden">
            {items.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground",
                    isActive && "border-primary bg-primary-soft text-primary",
                  )
                }
              >
                <Icon className="size-4" /> {label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
