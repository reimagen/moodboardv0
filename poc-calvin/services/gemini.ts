import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const searchBrandReferences = async (brandName: string): Promise<{urls: string[], analysis: string}> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the current visual identity and aesthetic of the brand "${brandName}". Provide a summary and 6 distinct visual style descriptions for image generation.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          styles: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  const data = JSON.parse(response.text || '{"styles":[], "analysis":""}');
  // We use the styles to seed high-quality placeholder refs (in a real app these might be search result images)
  const urls = data.styles.map((_: any, i: number) => `https://picsum.photos/seed/${brandName}-${i + Math.random()}/1200/1200`);
  return { urls, analysis: data.analysis };
};

export const analyzeProductImage = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: "Analyze this product. What are its key design features, materials, and which high-end brands would it pair best with for a marketing campaign?" }
      ]
    }
  });
  return response.text || "";
};

export const generateProImage = async (
  productImage: string,
  referenceContext: string,
  config: { aspectRatio: string, imageSize: string }
): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { inlineData: { data: productImage.split(',')[1], mimeType: 'image/png' } },
        { text: `Create a professional advertisement image. Aesthetic context: ${referenceContext}. Focus on the product from the uploaded image.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio as any,
        imageSize: config.imageSize as any
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  }
  throw new Error("Failed to generate pro image");
};

export const editImageWithPrompt = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  }
  throw new Error("Failed to edit image");
};

export const generateAestheticSummary = async (moodboardUrls: string[]): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Write a high-end 3-sentence aesthetic manifesto for a moodboard containing ${moodboardUrls.length} luxury images.`,
  });
  return response.text || "";
};
