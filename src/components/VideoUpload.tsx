import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/pages/Index";

interface VideoUploadProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
}

export const VideoUpload = ({ onAnalysisComplete, isAnalyzing, setIsAnalyzing }: VideoUploadProps) => {
  const [inputType, setInputType] = useState<"url" | "upload">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!videoTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a video title for analysis",
        variant: "destructive",
      });
      return;
    }

    if (inputType === "url" && !videoUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please provide a video URL",
        variant: "destructive",
      });
      return;
    }

    if (inputType === "upload" && !videoFile) {
      toast({
        title: "File required",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Step 1: Transcribe video
      toast({
        title: "Transcribing video...",
        description: "Extracting audio and converting to text",
      });

      const transcribeResponse = await supabase.functions.invoke("transcribe-video", {
        body: {
          videoUrl: inputType === "url" ? videoUrl : null,
          videoFile: inputType === "upload" && videoFile ? await fileToBase64(videoFile) : null,
          title: videoTitle,
          description: videoDescription,
        },
      });

      if (transcribeResponse.error) {
        throw new Error(transcribeResponse.error.message);
      }

      const transcript = transcribeResponse.data.transcript;

      // Step 2: Analyze relevance
      toast({
        title: "Analyzing relevance...",
        description: "Comparing content with title and description",
      });

      const analyzeResponse = await supabase.functions.invoke("analyze-relevance", {
        body: {
          title: videoTitle,
          description: videoDescription,
          transcript,
        },
      });

      if (analyzeResponse.error) {
        throw new Error(analyzeResponse.error.message);
      }

      onAnalysisComplete(analyzeResponse.data);

      // Clear form after successful analysis
      setVideoUrl("");
      setVideoTitle("");
      setVideoDescription("");
      setVideoFile(null);

      toast({
        title: "Analysis complete!",
        description: "Your video has been analyzed successfully",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze video. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Card className="max-w-3xl mx-auto p-10 shadow-elevated border-border bg-gradient-card animate-fade-in backdrop-blur-sm">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">Upload Your Video</h2>
          <p className="text-muted-foreground text-lg">
            Choose your input method and provide video details for AI analysis
          </p>
        </div>

        {/* Input Type Toggle */}
        <div className="flex gap-3 p-1.5 bg-muted/50 rounded-xl border border-border/50">
          <Button
            variant={inputType === "url" ? "default" : "ghost"}
            className="flex-1 h-12 font-semibold transition-all duration-300"
            onClick={() => setInputType("url")}
          >
            <LinkIcon className="w-5 h-5 mr-2" />
            Video URL
          </Button>
          <Button
            variant={inputType === "upload" ? "default" : "ghost"}
            className="flex-1 h-12 font-semibold transition-all duration-300"
            onClick={() => setInputType("upload")}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload File
          </Button>
        </div>

        {/* Video Input */}
        <div className="space-y-2">
          <Label htmlFor="video-input" className="text-base font-semibold">
            {inputType === "url" ? "Video URL" : "Upload Video"}
          </Label>
          {inputType === "url" ? (
            <Input
              id="video-input"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isAnalyzing}
              className="h-12 text-base border-2 focus:border-primary transition-colors"
            />
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary transition-all duration-300 cursor-pointer bg-muted/20 hover:bg-muted/40">
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
                disabled={isAnalyzing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-base font-semibold mb-2">
                  {videoFile ? videoFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">
                  MP4, WebM, MP3, or any video/audio format
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-semibold">Video Title *</Label>
          <Input
            id="title"
            placeholder="Enter the video title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            disabled={isAnalyzing}
            className="h-12 text-base border-2 focus:border-primary transition-colors"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">Video Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Provide additional context or expected content..."
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            disabled={isAnalyzing}
            rows={4}
            className="text-base border-2 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Analyze Button */}
        <Button
          className="w-full h-14 text-lg font-bold shadow-glow hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]"
          size="lg"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Video
            </>
          )}
        </Button>

        {isAnalyzing && (
          <div className="bg-gradient-primary/5 border border-primary/20 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-center text-foreground mt-3 font-medium">
              Processing video content... This may take a few moments
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
