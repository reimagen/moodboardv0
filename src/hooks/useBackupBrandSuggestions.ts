import { useState, useEffect } from 'react';
import { BrandSuggestion } from '../types';
import { getBackupBrandSuggestions } from '../services/gemini/backupBrandSuggestionsClient';

export const useBackupBrandSuggestions = (productAnalysis: string, skip: boolean) => {
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip || !productAnalysis) {
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSuggestions = await getBackupBrandSuggestions(productAnalysis);
        setSuggestions(fetchedSuggestions);
      } catch (err) {
        console.error("Failed to fetch backup brand suggestions:", err);
        setError("Failed to load backup brand suggestions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [productAnalysis, skip]);

  return { suggestions, isLoading, error };
};
