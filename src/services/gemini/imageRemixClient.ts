import { getAI } from "./geminiClient";
import { GEMINI_MODELS_DEV } from "./geminiModels";

export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS_DEV.editImage,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(",")[1], mimeType: "image/png" } },
        { text: prompt },
      ],
    },
  });

  const imagePart = response.candidates?.[0]?.content.parts.find((p) => (p as any).inlineData);
  if ((imagePart as any)?.inlineData) {
    return `data:image/png;base64,${(imagePart as any).inlineData.data}`;
  }
  throw new Error("Failed to edit image");
};
