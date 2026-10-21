import { cn } from "@/lib/utils";
import ImageWithFallback from "./ImageWithFallback";

const CompanyLogo = ({ company, size = "md", className }) => (
  <ImageWithFallback
    src={company?.logo?.url}
    name={company?.name}
    size={size}
    className={cn("border bg-card text-primary", className)}
    imageClassName="object-contain p-1"
  />
);

export default CompanyLogo;
