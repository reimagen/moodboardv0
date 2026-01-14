import { BrandSuggestion } from '../types';

export const parseBrandSuggestions = (analysis: string): BrandSuggestion[] => {
  const brandsSectionMatch = analysis.match(/5 Brands with Similar Aesthetics:\*\*([\s\S]*)/);
  if (!brandsSectionMatch || !brandsSectionMatch[1]) {
    return [];
  }

  const brandsText = brandsSectionMatch[1];
  const brandLines = brandsText.split('\n').filter(line => line.match(/^\d+\./));

  return brandLines.map(line => {
    const match = line.match(/^\d+\s*\*\*(.*?)\*\*:\s*(.*)/);
    if (match && match[1] && match[2]) {
      return { name: match[1].trim(), category: match[2].trim() };
    }
    return { name: "Unknown", category: "Unknown" };
  });
};
