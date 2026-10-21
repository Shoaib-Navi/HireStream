import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// How well a candidate's profile fits a job: skills carry the most weight, then experience and location
const toneFor = (score) => (score >= 75 ? "success" : score >= 50 ? "warning" : "neutral");

const MatchScore = ({ match, className }) =>
  match ? (
    <Badge variant={toneFor(match.score)} className={className}>
      {match.score}% match
    </Badge>
  ) : null;

export const MatchBreakdown = ({ match, className }) => {
  if (!match) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="type-label text-muted-foreground">Profile match</span>
          <span className="type-h3 text-foreground">{match.score}%</span>
        </div>
        <Progress value={match.score} aria-label={`${match.score}% match`} />
      </div>

      {match.matchedSkills.length > 0 && (
        <div className="space-y-2">
          <p className="type-caption text-muted-foreground">Skills you have</p>
          <div className="flex flex-wrap gap-1.5">
            {match.matchedSkills.map((skill) => (
              <Badge key={skill} variant="success">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {match.missingSkills.length > 0 && (
        <div className="space-y-2">
          <p className="type-caption text-muted-foreground">Skills to add</p>
          <div className="flex flex-wrap gap-1.5">
            {match.missingSkills.map((skill) => (
              <Badge key={skill} variant="neutral">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchScore;
