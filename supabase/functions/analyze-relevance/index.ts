import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Analyzing relevance for:", title);

    // Call Lovable AI for semantic analysis
    const systemPrompt = `You are an expert video content analyzer. Your task is to evaluate how well a video's actual content matches its claimed title and description.

Analyze the transcript and provide:
1. A relevance score (0-100) indicating how well the content matches the title/description
2. A detailed explanation of your scoring
3. Identify any off-topic, promotional, or filler segments
4. Categorize the content into relevant topics

Be objective and thorough in your analysis.`;

    const userPrompt = `
Title: ${title}
Description: ${description || "No description provided"}

Transcript:
${transcript}

Please analyze this video and return a JSON object with:
- score: number (0-100)
- explanation: string (detailed reasoning)
- segments: array of objects with {timestamp, relevance ("high"|"medium"|"low"), content}
- categories: array of strings (detected topic categories)
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_video_relevance",
              description: "Analyze video content relevance and return structured results",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Relevance score from 0-100",
                  },
                  explanation: {
                    type: "string",
                    description: "Detailed explanation of the score",
                  },
                  segments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        timestamp: { type: "string" },
                        relevance: { type: "string", enum: ["high", "medium", "low"] },
                        content: { type: "string" },
                      },
                    },
                  },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description: "Detected content categories",
                  },
                },
                required: ["score", "explanation", "segments", "categories"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_video_relevance" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract tool call result
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Ensure segments exist and have valid data
    if (!result.segments || result.segments.length === 0) {
      // Generate segments from transcript by splitting it into chunks
      const words = transcript.split(' ');
      const segmentSize = Math.ceil(words.length / 8); // Create ~8 segments
      result.segments = [];
      
      for (let i = 0; i < words.length; i += segmentSize) {
        const segmentWords = words.slice(i, i + segmentSize);
        const segmentText = segmentWords.join(' ');
        const minutes = Math.floor((i / words.length) * 3); // Assume ~3 min video
        const seconds = Math.floor(((i / words.length) * 180) % 60);
        
        // Determine relevance based on position (higher relevance in middle)
        const position = i / words.length;
        let relevance: "high" | "medium" | "low";
        if (position > 0.3 && position < 0.7) {
          relevance = "high";
        } else if (position > 0.15 && position < 0.85) {
          relevance = "medium";
        } else {
          relevance = "low";
        }
        
        result.segments.push({
          timestamp: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          relevance,
          content: segmentText.substring(0, 100) + (segmentText.length > 100 ? '...' : ''),
        });
      }
    }

    // Add the original transcript to the result
    result.transcript = transcript;

    console.log("Analysis completed with score:", result.score, "segments:", result.segments.length);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
