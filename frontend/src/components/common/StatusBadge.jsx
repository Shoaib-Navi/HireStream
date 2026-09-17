import { CalendarClock, CheckCircle2, FileText, ListChecks, MinusCircle, Send, UserCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_META, COMPANY_STATUS_META, JOB_STATUS_META, ROLE_META, USER_STATUS_META } from "@/lib/constants";

const STATUS_META = {
  application: APPLICATION_STATUS_META,
  job: JOB_STATUS_META,
  user: USER_STATUS_META,
  company: COMPANY_STATUS_META,
  role: ROLE_META,
};

// Pipeline and job states read as icon plus label. Roles and account states stay text only,
// so tables of them do not turn into a column of icons.
const STATUS_ICONS = {
  application: {
    applied: Send,
    shortlisted: ListChecks,
    interview: CalendarClock,
    offered: FileText,
    hired: UserCheck,
    rejected: XCircle,
    withdrawn: MinusCircle,
  },
  job: {
    draft: FileText,
    open: CheckCircle2,
    closed: XCircle,
  },
};

const StatusBadge = ({ status, type = "application", className }) => {
  const meta = STATUS_META[type]?.[status] ?? { label: status, tone: "neutral" };
  const Icon = STATUS_ICONS[type]?.[status];

  return (
    <Badge variant={meta.tone} className={className}>
      {Icon && <Icon aria-hidden="true" />}
      {meta.label}
    </Badge>
  );
};

export default StatusBadge;
