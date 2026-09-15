import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CHECKS = [
  { label: "Headline", isDone: (profile) => Boolean(profile.headline) },
  { label: "Location", isDone: (profile) => Boolean(profile.location) },
  { label: "About you", isDone: (profile) => Boolean(profile.bio) },
  { label: "Skills", isDone: (profile) => profile.skills?.length > 0 },
  { label: "Experience or education", isDone: (profile) => profile.experience?.length > 0 || profile.education?.length > 0 },
  { label: "Resume", isDone: (profile) => Boolean(profile.resume?.url) },
];

const ProfileCompletion = ({ profile }) => {
  const missing = CHECKS.filter((check) => !check.isDone(profile));
  const percent = Math.round(((CHECKS.length - missing.length) / CHECKS.length) * 100);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="type-h4 text-foreground">Profile strength</p>
          <p className="type-caption text-muted-foreground">
            {missing.length === 0
              ? "Your profile is complete. Nice work!"
              : "Complete profiles get more attention from recruiters."}
          </p>
        </div>
        <span className="type-h2 text-primary">{percent}%</span>
      </div>
      <Progress value={percent} className="mt-4" aria-label="Profile completion" />
      {missing.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {missing.map((check) => (
            <Badge key={check.label} variant="neutral">
              Add {check.label.toLowerCase()}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
