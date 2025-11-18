import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RelevanceScore } from "@/components/RelevanceScore";
import { TranscriptViewer } from "@/components/TranscriptViewer";
import { RelevanceHeatmap } from "@/components/RelevanceHeatmap";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@/pages/Index";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export const AnalysisResults = ({ result, onNewAnalysis }: AnalysisResultsProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `video-analysis-${Date.now()}.json`;
    link.click();

    toast({
      title: "Report exported",
      description: "Analysis report downloaded successfully",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Video Relevance Analysis",
        text: `Relevance Score: ${result.score}% - ${result.explanation}`,
      });
    } else {
      toast({
        title: "Share not supported",
        description: "Sharing is not supported on this device",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onNewAnalysis}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <RelevanceScore score={result.score} explanation={result.explanation} />

      {/* Categories */}
      {result.categories && result.categories.length > 0 && (
        <Card className="p-6 shadow-card border-border bg-gradient-card">
          <h3 className="text-lg font-semibold mb-4">Detected Categories</h3>
          <div className="flex flex-wrap gap-2">
            {result.categories.map((category, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
              >
                {category}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Heatmap */}
      {result.segments && result.segments.length > 0 && (
        <RelevanceHeatmap segments={result.segments} />
      )}

      {/* Transcript */}
      <TranscriptViewer transcript={result.transcript} segments={result.segments} />
    </div>
  );
};
