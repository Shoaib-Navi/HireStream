import { ListChecks, Search, Send } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import GridBackground from "@/components/common/GridBackground";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { getDashboardHome } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

const HIGHLIGHTS = [
  { icon: Search, title: "Find the right role", text: "Search by skills, location, work mode and salary." },
  { icon: Send, title: "Apply in minutes", text: "Your profile and resume are reused for every application." },
  { icon: ListChecks, title: "Track every step", text: "See when you're shortlisted, invited to interview or hired." },
];

const AuthLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Signed-in users (including right after logging in) go back where they came from, or to their dashboard
  if (user) {
    return <Navigate to={location.state?.from || getDashboardHome(user.role)} replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <GridBackground
        className="hidden bg-brand-950 text-white lg:block"
        lineColor="color-mix(in oklab, white 6%, transparent)"
      >
        <div className="flex h-full flex-col justify-between p-12">
          <Logo className="text-white [&_span_span]:text-brand-300" />
          <div className="max-w-md space-y-10">
            <div className="space-y-3">
              <h2 className="type-h1">Your next role is one search away.</h2>
              <p className="type-body-lg text-brand-100/80">
                One profile for every application, and a clear view of where each one stands.
              </p>
            </div>
            <ul className="space-y-6">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-200">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="type-body text-brand-100/70">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="type-caption text-brand-100/50">© {new Date().getFullYear()} HireStream</p>
        </div>
      </GridBackground>

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
