import { Navigate, Outlet, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import ScrambleText from "@/components/common/ScrambleText";
import ThemeToggle from "@/components/common/ThemeToggle";
import { getDashboardHome } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

const HIGHLIGHTS = [
  { title: "Find the right role", text: "Search by skills, location, work mode and salary." },
  { title: "Apply in minutes", text: "Your profile and resume go with every application." },
  { title: "Track every step", text: "See when you're shortlisted, invited to interview or hired." },
];

const AuthLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Signed-in users (including right after logging in) go back where they came from, or to their dashboard
  if (user) {
    return <Navigate to={location.state?.from || getDashboardHome(user.role)} replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="dark hidden flex-col justify-between bg-background p-12 text-foreground lg:flex">
        <Logo />
        <div className="space-y-12">
          <div className="space-y-5">
            <ScrambleText text="One profile. Every application." className="type-label block text-muted-foreground" />
            <h2 className="type-h1 max-w-md">Your next role is one search away.</h2>
          </div>
          <ol className="border-t">
            {HIGHLIGHTS.map(({ title, text }, index) => (
              <li key={title} className="flex gap-6 border-b py-5">
                <span className="type-h4 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="type-h4">{title}</p>
                  <p className="type-body text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="type-caption text-muted-foreground">© {new Date().getFullYear()} HireStream</p>
      </aside>

      <main id="main" className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
