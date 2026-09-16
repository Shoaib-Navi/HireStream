import { LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DASHBOARD_NAV, getDashboardHome } from "@/config/navigation";
import { useLogoutMutation } from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks/useAuth";

const ITEM = "type-label rounded-md px-3 py-2.5 text-muted-foreground focus:bg-accent focus:text-foreground";

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
        className="rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label="Open account menu"
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-66 p-0">
        {/* Identity block, styled like the rest of the app rather than a plain menu label */}
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="type-h4 truncate text-foreground">{user.fullName}</p>
            <p className="type-caption truncate text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <span className="type-overline text-muted-foreground">Signed in as</span>
          <StatusBadge type="role" status={user.role} />
        </div>

        <div className="border-t p-1.5">
          <DropdownMenuItem asChild className={ITEM}>
            <Link to={getDashboardHome(user.role)}>
              <LayoutDashboard /> Dashboard
            </Link>
          </DropdownMenuItem>
          {(DASHBOARD_NAV[user.role] ?? []).map(({ label, to, icon: Icon }) => (
            <DropdownMenuItem key={to} asChild className={ITEM}>
              <Link to={to}>
                <Icon /> {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />
        <div className="p-1.5">
          <DropdownMenuItem variant="destructive" className={ITEM} onSelect={handleLogout}>
            <LogOut /> Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
