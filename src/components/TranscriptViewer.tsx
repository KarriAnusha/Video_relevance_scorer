import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface TranscriptViewerProps {
  transcript: string;
  segments?: Array<{
    timestamp: string;
    relevance: "high" | "medium" | "low";
    content: string;
  }>;
}

export const TranscriptViewer = ({ transcript, segments }: TranscriptViewerProps) => {
  const relevanceColors = {
    high: "bg-success/10 border-success/30",
    medium: "bg-warning/10 border-warning/30",
    low: "bg-destructive/10 border-destructive/30",
  };

  return (
    <Card className="shadow-card border-border bg-gradient-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Full Transcript</h3>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-6 space-y-4">
          {segments && segments.length > 0 ? (
            segments.map((segment, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${relevanceColors[segment.relevance]} transition-all hover:shadow-soft`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded">
                    {segment.timestamp}
                  </span>
                  <span
                    className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      segment.relevance === "high"
                        ? "text-success bg-success/20"
                        : segment.relevance === "medium"
                        ? "text-warning bg-warning/20"
                        : "text-destructive bg-destructive/20"
                    }`}
                  >
                    {segment.relevance}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{segment.content}</p>
              </div>
            ))
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
