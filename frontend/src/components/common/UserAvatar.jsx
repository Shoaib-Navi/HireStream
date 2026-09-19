import { cn } from "@/lib/utils";
import ImageWithFallback from "./ImageWithFallback";

const UserAvatar = ({ user, size = "sm", className }) => (
  <ImageWithFallback
    src={user?.avatar?.url}
    name={user?.fullName}
    size={size}
    shape="circle"
    className={cn("bg-muted text-muted-foreground", className)}
  />
);

export default UserAvatar;
