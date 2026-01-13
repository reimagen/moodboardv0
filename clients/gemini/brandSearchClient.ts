import { Type } from "@google/genai";
import { getAI } from "./geminiClient";
import { GEMINI_MODELS_DEV } from "./geminiModels";

export const searchBrandReferences = async (
  brandName: string
): Promise<{ urls: string[]; analysis: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS_DEV.brandSearch,
      contents: `Analyze the current visual identity and aesthetic of the brand "${brandName}". Provide a summary and 6 distinct visual style descriptions for image generation.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            styles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || '{"styles":[], "analysis":""}');
    const styles = Array.isArray(data.styles) ? data.styles : [];
    // Styles seed placeholder refs (replace with real search results in production)
    const urls = styles.map((_: any, i: number) => `https://picsum.photos/seed/${brandName}-${i + Math.random()}/1200/1200`);
    return { urls, analysis: data.analysis || "" };
  } catch (err) {
    console.error("Brand search failed, returning fallback refs", err);
    // Fallback placeholders to keep the flow moving
    const urls = Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/${brandName}-fallback-${i + 1}/1200/1200`);
    return {
      urls,
      analysis: `Style cues for ${brandName}. (Fallback without live brand search.)`,
    };
  }
};
