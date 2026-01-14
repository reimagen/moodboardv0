import React, { useMemo } from "react";
import { useProduct } from "../contexts/ProductContext";
import { useBrandSearchState } from "../contexts/BrandSearchContext";
import { useBrandSuggestions } from '../contexts/BrandSuggestionContext'; // New import
import { BrandSuggestion } from '../types';

const FindInspirationStep: React.FC = () => {
  const { productAnalysis } = useProduct();
  const { brandName, setBrandName, handleBrandSearch } = useBrandSearchState();
  const {
    initialBrandSuggestions,
    isLoadingInitialSuggestions,
    initialSuggestionsError
  } = useBrandSuggestions(); // Consume new context

  const handleSelectSuggestion = (suggestionName: string) => {
    setBrandName(suggestionName);
    handleBrandSearch(); // Trigger search immediately
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tighter leading-tight">
          Find Your <br />
          <span className="text-blue-600 underline underline-offset-8">
            Inspiration.
          </span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore brands with similar aesthetics or search for a new one to define your moodboard's style.
        </p>
      </div>

      {/* Brand Search Input */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="e.g., Apple, Prada, Rimowa..."
          className="w-full bg-white border-2 border-gray-100 p-6 rounded-2xl text-xl focus:outline-none focus:border-blue-600 transition-all shadow-lg"
        />
        <button
          onClick={handleBrandSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-black transition-colors"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/* Example Brands from Analysis */}
      {isLoadingInitialSuggestions && (
        <div className="p-4 text-center text-gray-500">Loading brand suggestions...</div>
      )}
      {initialSuggestionsError && (
        <div className="p-4 text-center text-red-500">Error loading brand suggestions: {initialSuggestionsError}</div>
      )}
      {initialBrandSuggestions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 text-center">Suggested Brands</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {initialBrandSuggestions.map((brand, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(brand.name)}
                className="glass-card p-4 rounded-xl text-center shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-300 cursor-pointer space-y-1"
              >
                <p className="font-bold text-blue-600">{brand.name}</p>
                <p className="text-xs text-gray-500">{brand.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {initialBrandSuggestions.length === 0 && !isLoadingInitialSuggestions && !initialSuggestionsError && productAnalysis && (
          <div className="p-4 text-center text-gray-500">
              No brand suggestions found. Try searching above.
          </div>
      )}
    </div>
  );
};

export default FindInspirationStep;
