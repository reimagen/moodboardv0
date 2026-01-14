import { getAI } from "./geminiClient";
import { GEMINI_MODELS_DEV } from "./geminiModels";

// Abridged product analysis for testing: shorter prompt/response to save cost/time
export const analyzeProductImageTest = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS_DEV.productAnalysis,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(",")[1], mimeType: "image/png" } },
        {
          text: "Briefly list 3 bullet points: key design features, primary material cues. Then, list 5 brands that have similar aesthetics, along with their industry/category. Keep it short for testing.",
        },
      ],
    },
  });
  return response.text || "";
};
