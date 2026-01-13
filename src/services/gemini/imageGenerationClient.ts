import { getAI } from "./geminiClient";
import { GEMINI_MODELS_DEV } from "./geminiModels";

export const generateProImage = async (
  productImage: string,
  referenceContext: string,
  config: { aspectRatio: string; imageSize: string }
): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS_DEV.generateImage,
    contents: {
      parts: [
        { inlineData: { data: productImage.split(",")[1], mimeType: "image/png" } },
        { text: `Create a professional advertisement image. Aesthetic context: ${referenceContext}. Focus on the product from the uploaded image.` },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio as any,
        imageSize: config.imageSize as any,
      },
    },
  });

  const imagePart = response.candidates?.[0]?.content.parts.find((p) => (p as any).inlineData);
  if ((imagePart as any)?.inlineData) {
    return `data:image/png;base64,${(imagePart as any).inlineData.data}`;
  }
  throw new Error("Failed to generate image");
};
