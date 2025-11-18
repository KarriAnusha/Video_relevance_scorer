import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface RelevanceHeatmapProps {
  segments: Array<{
    timestamp: string;
    relevance: "high" | "medium" | "low";
    content: string;
  }>;
}

export const RelevanceHeatmap = ({ segments }: RelevanceHeatmapProps) => {
  const relevanceToHeight = {
    high: 100,
    medium: 65,
    low: 35,
  };

  const relevanceToColor = {
    high: "bg-success",
    medium: "bg-warning",
    low: "bg-destructive",
  };

  return (
    <Card className="p-6 shadow-card border-border bg-gradient-card">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Relevance Heatmap</h3>
        <span className="text-sm text-muted-foreground ml-auto">Timeline View</span>
      </div>

      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-muted-foreground">High Relevance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-muted-foreground">Medium Relevance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-muted-foreground">Low Relevance</span>
          </div>
        </div>

        {/* Heatmap Bars */}
        <div className="flex items-end gap-1.5 h-40 bg-muted/30 rounded-lg p-4">
          {segments.map((segment, idx) => {
            const height = relevanceToHeight[segment.relevance];
            return (
              <div
                key={idx}
                className="group relative flex-1 min-w-[8px] flex flex-col justify-end"
              >
                <div
                  className={`w-full ${relevanceToColor[segment.relevance]} rounded-t-md transition-all hover:opacity-90 hover:scale-105 cursor-pointer shadow-sm`}
                  style={{ height: `${height}%`, minHeight: '20px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max max-w-xs">
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <div className="text-xs font-mono text-muted-foreground mb-1">
                        {segment.timestamp}
                      </div>
                      <div className="text-xs font-semibold mb-1 capitalize">
                        {segment.relevance} Relevance
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {segment.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timestamps */}
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{segments[0]?.timestamp || "0:00"}</span>
          <span>{segments[Math.floor(segments.length / 2)]?.timestamp || ""}</span>
          <span>{segments[segments.length - 1]?.timestamp || "End"}</span>
        </div>
      </div>
    </Card>
  );
};
