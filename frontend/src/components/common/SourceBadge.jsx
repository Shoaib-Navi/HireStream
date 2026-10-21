import { Badge } from "@/components/ui/badge";

// Development data says where it came from. Jobs and companies created through the app
// carry no marker, so nothing real is ever labelled as a sample.
const LABELS = {
  SYNTHETIC: { label: "Sample data", tone: "neutral" },
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
