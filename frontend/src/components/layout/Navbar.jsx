import { Link, NavLink } from "react-router-dom";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_LINKS } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const { user, isRecruiter } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-muted text-foreground",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {isRecruiter && (
            <Button asChild size="sm" variant="soft" className="hidden sm:inline-flex">
              <Link to="/recruiter/jobs/new">Post a job</Link>
            </Button>
          )}
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign up</Link>
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
