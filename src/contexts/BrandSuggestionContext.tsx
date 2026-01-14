import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useProduct } from './ProductContext';
import { BrandSuggestion } from '../types';
import { parseBrandSuggestions } from '../utils/brandSuggestionParser';
import { getBackupBrandSuggestions } from '../services/gemini/backupBrandSuggestionsClient';
import { useSharedState } from './SharedStateContext';

interface BrandSuggestionContextType {
  initialBrandSuggestions: BrandSuggestion[];
  isLoadingInitialSuggestions: boolean;
  initialSuggestionsError: string | null;
}

const BrandSuggestionContext = createContext<BrandSuggestionContextType | undefined>(undefined);

export const BrandSuggestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { productAnalysis } = useProduct();
  const { useTestFlows } = useSharedState(); // To potentially use test data for backup suggestions

  const [initialBrandSuggestions, setInitialBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [isLoadingInitialSuggestions, setIsLoadingInitialSuggestions] = useState(false);
  const [initialSuggestionsError, setInitialSuggestionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!productAnalysis) {
        setInitialBrandSuggestions([]);
        setIsLoadingInitialSuggestions(false);
        return;
      }

      setIsLoadingInitialSuggestions(true);
      setInitialSuggestionsError(null);

      // 1. Try to parse from productAnalysis
      const parsed = parseBrandSuggestions(productAnalysis);

      if (parsed.length >= 5) {
        setInitialBrandSuggestions(parsed.slice(0, 5)); // Ensure max 5
        setIsLoadingInitialSuggestions(false);
        return;
      }

      // 2. If parsing yields fewer than 5, try to get backup suggestions
      try {
        const backup = await getBackupBrandSuggestions(productAnalysis);
        const uniqueSuggestions = new Map<string, BrandSuggestion>();

        // Add parsed suggestions first
        parsed.forEach(s => uniqueSuggestions.set(s.name.toLowerCase(), s));

        // Fill with backup suggestions if needed
        backup.forEach(s => {
          if (uniqueSuggestions.size < 5 && !uniqueSuggestions.has(s.name.toLowerCase())) {
            uniqueSuggestions.set(s.name.toLowerCase(), s);
          }
        });

        setInitialBrandSuggestions(Array.from(uniqueSuggestions.values()).slice(0, 5));
      } catch (error) {
        console.error("Failed to get backup brand suggestions:", error);
        setInitialSuggestionsError("Failed to get brand suggestions.");
        // Fallback to just parsed if backup fails
        setInitialBrandSuggestions(parsed.slice(0, 5));
      } finally {
        setIsLoadingInitialSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [productAnalysis, useTestFlows]); // Rerun if analysis changes or test mode changes

  const value = useMemo(() => ({
    initialBrandSuggestions,
    isLoadingInitialSuggestions,
    initialSuggestionsError,
  }), [initialBrandSuggestions, isLoadingInitialSuggestions, initialSuggestionsError]);

  return (
    <BrandSuggestionContext.Provider value={value}>
      {children}
    </BrandSuggestionContext.Provider>
  );
};

export const useBrandSuggestions = () => {
  const context = useContext(BrandSuggestionContext);
  if (context === undefined) {
    throw new Error('useBrandSuggestions must be used within a BrandSuggestionProvider');
  }
  return context;
};
