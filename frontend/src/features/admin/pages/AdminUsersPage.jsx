import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ROLE_META, USER_STATUS_META } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useGetAdminUsersQuery, useUpdateUserStatusMutation } from "../api";
import { AdminSearch, FilterSelect } from "../components/AdminFilters";
import { useAdminFilters } from "../hooks/useAdminFilters";

const toOptions = (meta) => Object.entries(meta).map(([value, { label }]) => ({ value, label }));

const AdminUsersPage = () => {
  useDocumentTitle("Users");
  const { user: currentUser } = useAuth();
  const { filters, update, setPage, params } = useAdminFilters({ role: "", status: "" });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAdminUsersQuery(params);
  const [updateStatus, { isLoading: updating }] = useUpdateUserStatusMutation();
  const [userToSuspend, setUserToSuspend] = useState(null);

  const users = data?.users ?? [];

  const changeStatus = async (user, status) => {
    try {
      await updateStatus({ id: user._id, status }).unwrap();
      toast.success(status === "suspended" ? `${user.fullName} was suspended` : `${user.fullName} was reactivated`);
      setUserToSuspend(null);
    } catch (apiError) {
      toast.error(getErrorMessage(apiError));
    }
  };

  const renderTable = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load users" error={error} onRetry={refetch} />;
    if (users.length === 0) return <EmptyState title="No users match these filters" />;

    return (
      <div className={cn("overflow-x-auto rounded-xl border bg-card transition-opacity", isFetching && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user._id === currentUser?.id || user._id === currentUser?._id;
              const isAdmin = user.role === "admin";
              return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="type-body truncate font-medium text-foreground">{user.fullName}</p>
                        <p className="type-caption truncate text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="role" status={user.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="user" status={user.status} />
                  </TableCell>
                  <TableCell className="type-caption text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="type-caption text-muted-foreground">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    {isSelf || isAdmin ? (
                      <span className="type-caption text-muted-foreground">—</span>
                    ) : user.status === "suspended" ? (
                      <Button variant="outline" size="sm" disabled={updating} onClick={() => changeStatus(user, "active")}>
                        Reactivate
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setUserToSuspend(user)}>
                        Suspend
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Everyone with a HireStream account." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <AdminSearch value={filters.q} onChange={(q) => update({ q })} placeholder="Search by name or email" />
        <FilterSelect label="Roles" value={filters.role} options={toOptions(ROLE_META)} onChange={(role) => update({ role })} />
        <FilterSelect label="Statuses" value={filters.status} options={toOptions(USER_STATUS_META)} onChange={(status) => update({ status })} />
      </div>

      {renderTable()}

      <Pagination page={filters.page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(userToSuspend)}
        onOpenChange={(open) => !open && setUserToSuspend(null)}
        title={`Suspend ${userToSuspend?.fullName}?`}
        description="They'll be signed out everywhere and won't be able to log in until you reactivate the account."
        confirmLabel="Suspend account"
        destructive
        loading={updating}
        onConfirm={() => changeStatus(userToSuspend, "suspended")}
      />
    </div>
  );
};

export default AdminUsersPage;
