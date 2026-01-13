import { getAI } from "./geminiClient";
import { GEMINI_MODELS_DEV } from "./geminiModels";

export const analyzeProductImage = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS_DEV.productAnalysis,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(",")[1], mimeType: "image/png" } },
        {
          text: "Analyze this product. What are its key design features, materials, and which high-end brands would it pair best with for a marketing campaign?",
        },
      ],
    },
  });
  return response.text || "";
};
