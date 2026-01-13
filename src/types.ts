
export interface ProductData {
  url?: string;
  image?: string;
  id: string;
}

export interface BrandReference {
  name: string;
  images: string[];
}

export interface GenerationResult {
  id: string;
  url: string;
  status: 'pending' | 'liked' | 'disliked' | 'none';
}

export enum AppStep {
  UPLOAD = 'upload',
  BRAND_SEARCH = 'brand_search',
  SELECT_REFERENCES = 'select_references',
  GENERATE = 'generate', // Step 4: Generate Moodboard
  MOODBOARD = 'moodboard' // Step 5: Aesthetics Guide
}
