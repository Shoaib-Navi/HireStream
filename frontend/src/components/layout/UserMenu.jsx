import { LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import UserAvatar from "@/components/common/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DASHBOARD_NAV, getDashboardHome } from "@/config/navigation";
import { useLogoutMutation } from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks/useAuth";

const UserMenu = () => {
  const { user } = useAuth();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label="Open account menu"
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={getDashboardHome(user.role)}>
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        {(DASHBOARD_NAV[user.role] ?? []).map(({ label, to, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to}>
              <Icon /> {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
