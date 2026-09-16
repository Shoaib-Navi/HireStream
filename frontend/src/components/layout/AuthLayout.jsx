import { ArrowLeft } from "lucide-react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { getDashboardHome } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

const HIGHLIGHTS = [
  { title: "Find the right role", text: "Search by skills, location, work mode and salary." },
  { title: "Apply in minutes", text: "Your profile and resume go with every application." },
  { title: "Track every step", text: "See when you're shortlisted, invited to interview or hired." },
];

// Always dark, like the hero and footer: the form sits on the wide left column,
// with a supporting rail on the right, separated by hairlines.
const AuthLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Signed-in users (including right after logging in) go back where they came from, or to their dashboard
  if (user) {
    return <Navigate to={location.state?.from || getDashboardHome(user.role)} replace />;
  }

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <header className="page-container flex items-center justify-between gap-6 py-5">
        <Logo />
        <div className="flex items-center gap-1">
          <Link
            to="/jobs"
            className="type-label hidden items-center gap-1.5 px-3 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ArrowLeft className="size-3.5" /> Browse jobs
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 border-t">
        <div className="page-container grid items-start lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          <main id="main" className="py-12 lg:py-16 lg:pr-14">
            <Outlet />
          </main>

          <aside className="hidden border-l py-16 pl-14 lg:block">
            <p className="type-h3 max-w-[16rem]">One account, the whole hiring journey.</p>
            <ol className="mt-8 border-t">
              {HIGHLIGHTS.map(({ title, text }, index) => (
                <li key={title} className="flex gap-5 border-b py-5">
                  <span className="type-label pt-1 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="type-h4">{title}</p>
                    <p className="type-body text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      <footer className="border-t">
        <div className="page-container flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="type-caption text-muted-foreground">© {new Date().getFullYear()} HireStream</p>
          <Link to="/companies" className="type-label text-muted-foreground transition-colors hover:text-foreground">
            Companies hiring
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
