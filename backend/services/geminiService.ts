import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client configuration securely
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const _model = "gemini-2.5-flash";

export async function analyzeContentWithGemini(content: string, prompt: string): Promise<string> {
  if (!content) {
    throw new Error("Content payload is required for analysis");
  }

  // Performance Optimization: Truncate upfront to avoid memory/OOM bloat
  const truncatedContent = content.slice(0, 12000);

  try {
    const response = await ai.models.generateContent({
      model: _model,
      contents: `${prompt}\n\nContent:\n${truncatedContent}`,
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini API");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    throw new Error(`Gemini Service Failure: ${error?.message || "Unknown error"}`);
  }
}
