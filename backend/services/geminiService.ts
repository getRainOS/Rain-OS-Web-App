import { GoogleGenAI } from "@google/genai";

// Initialize configuration securely
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const _model = "gemini-2.5-flash";

export const API_VERSION = "v1";

// Helper for upfront optimization truncation
function truncatePayload(content: string): string {
  return content ? content.slice(0, 12000) : "";
}

export async function analyzeContent(content: string, prompt: string): Promise<string> {
  const truncated = truncatePayload(content);
  const response = await ai.models.generateContent({
    model: _model,
    contents: `${prompt}\n\nContent:\n${truncated}`,
  });
  return response.text || "";
}

export async function generateDescription(content: string): Promise<string> {
  return analyzeContent(content, "Generate a concise SEO description for the following content:");
}

export async function generateTitles(content: string): Promise<string> {
  return analyzeContent(content, "Generate 5 catchy, optimized titles for the following content:");
}

export async function rewriteSentence(content: string, instructions: string): Promise<string> {
  return analyzeContent(content, `Rewrite this sentence following these rules: ${instructions}`);
}

export async function summarizeContent(content: string): Promise<string> {
  return analyzeContent(content, "Provide a clean, bulleted summary of this content:");
}

export async function rewriteDocumentForAI(content: string): Promise<string> {
  return analyzeContent(content, "Optimize this document structure cleanly for LLM readability:");
}
