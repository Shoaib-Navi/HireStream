import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DASHBOARD_NAV, PUBLIC_NAV_LINKS } from "@/config/navigation";
import { useLogoutMutation } from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

const linkClassName = ({ isActive }) =>
  cn(
    "type-label flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground/80 transition-colors hover:bg-muted",
    isActive && "bg-primary-soft text-primary",
  );

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const dashboardItems = user ? (DASHBOARD_NAV[user.role] ?? []) : [];

  const handleLogout = async () => {
    close();
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle asChild>
            <div onClick={close}>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          {PUBLIC_NAV_LINKS.map(({ label, to }) => (
            <NavLink key={to} to={to} onClick={close} className={linkClassName}>
              {label}
            </NavLink>
          ))}
          {dashboardItems.length > 0 && <p className="type-overline mt-4 px-3 pb-1 text-muted-foreground">Dashboard</p>}
          {dashboardItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={close} className={linkClassName}>
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>

        <SheetFooter className="border-t">
          {user ? (
            <Button variant="outline" onClick={handleLogout}>
              <LogOut /> Log out
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/login" onClick={close}>
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register" onClick={close}>
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
