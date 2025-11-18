import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RelevanceScoreProps {
  score: number;
  explanation: string;
}

export const RelevanceScore = ({ score, explanation }: RelevanceScoreProps) => {
  const getScoreColor = () => {
    if (score >= 75) return "success";
    if (score >= 50) return "warning";
    return "destructive";
  };

  const getScoreIcon = () => {
    if (score >= 75) return CheckCircle2;
    if (score >= 50) return AlertTriangle;
    return AlertCircle;
  };

  const scoreColor = getScoreColor();
  const ScoreIcon = getScoreIcon();

  const colorClasses = {
    success: "text-success border-success/20 bg-success/10",
    warning: "text-warning border-warning/20 bg-warning/10",
    destructive: "text-destructive border-destructive/20 bg-destructive/10",
  };

  const progressClasses = {
    success: "[&>div]:bg-success",
    warning: "[&>div]:bg-warning",
    destructive: "[&>div]:bg-destructive",
  };

  return (
    <Card className="p-8 shadow-card border-border bg-gradient-card">
      <div className="flex items-start gap-6">
        {/* Score Display */}
        <div className="flex-shrink-0">
          <div
            className={`w-32 h-32 rounded-2xl border-4 ${colorClasses[scoreColor]} flex flex-col items-center justify-center animate-score-reveal shadow-glow`}
          >
            <div className="text-5xl font-bold">{score}</div>
            <div className="text-sm font-medium mt-1">/ 100</div>
          </div>
        </div>

        {/* Explanation */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ScoreIcon className={`w-5 h-5 ${colorClasses[scoreColor].split(" ")[0]}`} />
              <h3 className="text-xl font-bold">Relevance Analysis</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{explanation}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Relevance Score</span>
              <span>{score}%</span>
            </div>
            <Progress value={score} className={`h-3 ${progressClasses[scoreColor]}`} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
