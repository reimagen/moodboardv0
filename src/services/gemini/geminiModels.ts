// Centralized Gemini model mapping for key services (text vs. image)
export const GEMINI_MODELS = {
  brandSearch: "gemini-3-flash-preview", // text + search
  productAnalysis: "gemini-3-pro-preview", // text + vision input
  generateImage: "gemini-3-pro-image-preview", // image generation
  editImage: "gemini-2.5-flash-image", // image-to-image edits
  summary: "gemini-2.5-flash-lite", // text summary
} as const;

export type GeminiModelKey = keyof typeof GEMINI_MODELS;

// Lower-cost/testing defaults (swap in during early dev or test envs)
export const GEMINI_MODELS_DEV = {
  brandSearch: "gemini-2.5-flash", // lighter text + search
  productAnalysis: "gemini-2.5-flash", // text + vision input
  generateImage: "gemini-2.5-flash-image", // lighter image gen
  editImage: "gemini-2.5-flash-image", // lighter image edit
  summary: "gemini-2.5-flash-lite", // lower-cost text summary
} as const;

// Pricing notes (fill with current $/1K tokens or $/image from Google billing):
// gemini-3-flash-preview: TBD
// gemini-3-pro-preview: TBD
// gemini-3-pro-image-preview: TBD
// gemini-2.5-flash-image: TBD
// gemini-2.5-flash-lite: TBD
// gemini-2.5-flash: TBD
