import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_META, COMPANY_STATUS_META, JOB_STATUS_META, ROLE_META, USER_STATUS_META } from "@/lib/constants";

const STATUS_META = {
  application: APPLICATION_STATUS_META,
  job: JOB_STATUS_META,
  user: USER_STATUS_META,
  company: COMPANY_STATUS_META,
  role: ROLE_META,
};

const StatusBadge = ({ status, type = "application", className }) => {
  const meta = STATUS_META[type]?.[status] ?? { label: status, tone: "neutral" };
  return (
    <Badge variant={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
};

export default StatusBadge;
