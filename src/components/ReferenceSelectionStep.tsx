import React from "react";
import { useBrandSearchState } from "../contexts/BrandSearchContext";
import { useGeneration } from "../contexts/GenerationContext";

const ReferenceSelectionStep: React.FC = () => {
  const { brandName, brandRefs, selectedRefs, toggleReference, handleBrandSearch } = useBrandSearchState();
  const { startGeneration } = useGeneration();

  return (
    <div className="space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Select Reference Seed</h2>
        <p className="text-gray-500">
          Select at least <span className="font-bold text-black">5 images</span> that represent the specific vibe of{" "}
          <span className="text-blue-600 font-bold">{brandName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {brandRefs.map((url, i) => {
          const selected = selectedRefs.includes(url);
          return (
            <div
              key={`${url}-${i}`}
              onClick={() => toggleReference(url)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${
                selected ? "ring-4 ring-blue-600 scale-[0.98]" : "hover:scale-[1.02]"
              }`}
            >
              <img src={url} className="w-full aspect-square object-cover" alt="Brand reference" />
              <div
                className={`absolute inset-0 bg-blue-600/20 flex items-center justify-center transition-opacity ${
                  selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                }`}
              >
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                  <i className={`fa-solid ${selected ? "fa-check text-blue-600" : "fa-plus text-gray-400"}`}></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-8 gap-4 flex-wrap">
        <button
          disabled={selectedRefs.length < 5}
          onClick={() => startGeneration({} as any)} // TODO: Fix this
          className={`px-12 py-5 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-xl ${
            selectedRefs.length >= 5 ? "bg-black text-white hover:bg-blue-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Generate Synthesis ({selectedRefs.length}/5)
        </button>
        {handleBrandSearch && (
          <button
            onClick={handleBrandSearch}
            className="px-6 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow border border-gray-200 hover:border-blue-600 hover:text-blue-600 bg-white"
          >
            Refresh Images
          </button>
        )}
      </div>
    </div>
  );
};

export default ReferenceSelectionStep;
