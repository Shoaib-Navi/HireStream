import { useState } from "react";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-7 text-xs",
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

// Shows an image, or the initials of `name` when there is no image or it fails to load.
// Used by CompanyLogo and UserAvatar.
const ImageWithFallback = ({ src, name, size = "md", shape = "rounded", className, imageClassName }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden font-display font-semibold",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? ""}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className={cn("size-full object-cover", imageClassName)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name) || "?"}</span>
      )}
    </div>
  );
};

export default ImageWithFallback;
