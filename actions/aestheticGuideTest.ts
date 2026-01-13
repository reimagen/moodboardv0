import { getAI } from "../clients/gemini/geminiClient";
import { GEMINI_MODELS_DEV } from "../clients/gemini/geminiModels";

// Abridged aesthetic guide for testing (text-only, low-cost)
export const generateAestheticGuideTest = async (
  context: { productAnalysis: string; brandAnalysis: string; brandName: string }
): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS_DEV.summary,
    contents: [
      {
        text: [
          `Brief aesthetic manifesto (3 sentences) for brand ${context.brandName || "Unknown"}.`,
          `Use product analysis: ${context.productAnalysis || "N/A"}.`,
          `Use brand analysis: ${context.brandAnalysis || "N/A"}.`,
          `Keep it concise for testing.`,
        ].join(" "),
      },
    ],
  });
  return response.text || "";
};
