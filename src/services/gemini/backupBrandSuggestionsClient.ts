import { getAI } from "./geminiClient";
import { GEMINI_MODELS_DEV } from "./geminiModels";
import { BrandSuggestion } from '../../types'; // Assuming BrandSuggestion is defined in types.ts

export const getBackupBrandSuggestions = async (productAnalysis: string): Promise<BrandSuggestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS_DEV.brandSearch, // Using a model suitable for text-based brand suggestions
    contents: [{
      text: `Given the following product analysis: "${productAnalysis}", please suggest 5 top brands with similar aesthetics, along with their industry/category. Respond in a strict JSON array format, where each object has 'name' (string) and 'category' (string) fields. Do not include any other text before or after the JSON.`,
    }],
  });

  const textResponse = response.text || "";
  try {
    const brands = JSON.parse(textResponse) as BrandSuggestion[];
    // Add basic validation to ensure the parsed object is an array of BrandSuggestion
    if (Array.isArray(brands) && brands.every(b => typeof b.name === 'string' && typeof b.category === 'string')) {
        return brands;
    }
    console.error("Gemini backup response did not match expected BrandSuggestion[] format:", textResponse);
    return [];
  } catch (error) {
    console.error("Failed to parse Gemini backup response as JSON:", error, textResponse);
    return [];
  }
};
