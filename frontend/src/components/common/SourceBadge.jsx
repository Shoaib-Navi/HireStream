import { Badge } from "@/components/ui/badge";

// Postings mirrored from companies' public job boards say so; everything else carries no marker
const LABELS = {
  PUBLIC_SOURCE: { label: "Public listing", tone: "info" },
};

const SourceBadge = ({ source, className }) => {
  const meta = LABELS[source];
  if (!meta) return null;

  return (
    <Badge variant={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
};

export default SourceBadge;
