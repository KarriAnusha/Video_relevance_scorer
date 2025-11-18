import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Video, Brain, TrendingUp } from "lucide-react";

export interface AnalysisResult {
  score: number;
  explanation: string;
  transcript: string;
  segments: Array<{
    timestamp: string;
    relevance: "high" | "medium" | "low";
    content: string;
  }>;
  categories: string[];
}

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 animate-pulse-glow pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
              <Video className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Video Relevance AI
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Content Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl relative">
        {/* Hero Section */}
        {!analysisResult && !isAnalyzing && (
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 shadow-soft backdrop-blur-sm animate-float">
              <Brain className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">AI-Powered Analysis</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Evaluate Video Content
              <br />
              <span className="bg-gradient-secondary bg-clip-text">Relevance</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Upload any video or provide a URL. Our AI will transcribe, analyze, and score how well the content matches its title and description.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {[
                {
                  icon: Video,
                  title: "Auto Transcription",
                  desc: "AI-powered speech-to-text extraction",
                },
                {
                  icon: Brain,
                  title: "Smart Analysis",
                  desc: "Semantic relevance scoring with AI",
                },
                {
                  icon: TrendingUp,
                  title: "Detailed Insights",
                  desc: "Segment-by-segment breakdown",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-8 rounded-2xl bg-gradient-card border border-border shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!analysisResult && (
          <VideoUpload
            key={resetKey}
            onAnalysisComplete={setAnalysisResult}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}

        {/* Results Section */}
        {analysisResult && (
          <AnalysisResults
            result={analysisResult}
            onNewAnalysis={() => {
              setAnalysisResult(null);
              setIsAnalyzing(false);
              setResetKey(prev => prev + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with AI • Powered by Lovable Cloud</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
