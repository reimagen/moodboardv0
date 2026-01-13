import { getAI } from "./gemini/geminiClient";
import { GEMINI_MODELS } from "./gemini/geminiModels";

// Full-length aesthetic guide using moodboard images and contextual analyses
export const generateAestheticGuide = async (
  moodboardUrls: string[],
  context: { productAnalysis: string; brandAnalysis: string; brandName: string }
): Promise<string> => {
  const ai = getAI();
  const topImages = moodboardUrls.slice(0, 6); // limit payload
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.summary,
    contents: [
      {
        text: [
          `You are creating an aesthetic guide for a brand moodboard.`,
          `Brand: ${context.brandName || "Unknown"}.`,
          `Product analysis: ${context.productAnalysis || "N/A"}.`,
          `Brand analysis: ${context.brandAnalysis || "N/A"}.`,
          `Images (data URLs or links) are listed below; derive palette, materials, forms, and vibe from them.`,
          `Output 4-6 sentences:`,
          `1) A core aesthetic headline;`,
          `2) Palette/materials/finishes observed;`,
          `3) Forms/layout/lighting cues;`,
          `4) Positioning and tone;`,
          `5) Optional: how to extend this into packaging/site/social.`,
        ].join(" "),
      },
      ...topImages.map((url, idx) => ({ text: `Image ${idx + 1}: ${url}` })),
    ],
  });
  return response.text || "";
};
