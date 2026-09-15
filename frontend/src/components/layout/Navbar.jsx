import { ArrowRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_LINKS } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import MobileNav from "./MobileNav";
import UserMenu from "./UserMenu";

// Always dark, so it flows into the dark hero and footer
const Navbar = () => {
  const { user, isRecruiter } = useAuth();

  return (
    <header className="dark sticky top-0 z-40 border-b bg-background/95 text-foreground backdrop-blur-md">
      <div className="page-container flex h-[4.5rem] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {PUBLIC_NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn("type-label text-foreground/75 transition-colors hover:text-foreground", isActive && "text-foreground")
              }
            >
              {label}
            </NavLink>
          ))}
          {!user && (
            <NavLink to="/register?role=recruiter" className="type-label text-foreground/75 transition-colors hover:text-foreground">
              For employers
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isRecruiter && (
            <Button asChild variant="highlight" className="hidden sm:inline-flex">
              <Link to="/recruiter/jobs/new">
                Post a job <ArrowRight />
              </Link>
            </Button>
          )}
          {user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">
                  Get started <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
