import React from "react";
import { useGeneration } from "../contexts/GenerationContext";
import { useSharedState } from "../contexts/SharedStateContext";
import { AppStep } from "../types";

const GenerateGrid: React.FC = () => {
  const { generatedImages, handleRate, generationError } = useGeneration();
  const { navigate } = useSharedState();

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold tracking-tight">AI Generated Variations</h2>
        <button
          onClick={() => navigate(AppStep.SELECT_REFERENCES)}
          className="text-xs text-blue-600 font-bold uppercase underline underline-offset-4"
        >
          Change References
        </button>
      </div>
      {generationError && (
        <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
          {generationError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        {generatedImages.map((img) => (
          <div key={img.id} className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-200 aspect-square">
            <img src={img.url} className="w-full h-full object-cover" alt="Generated variation" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6">
              <button
                onClick={() => handleRate(img.id, false)}
                className={`w-14 h-14 backdrop-blur-md rounded-full text-white transition-colors ${
                  img.status === "disliked" ? "bg-red-600" : "bg-white/20 hover:bg-red-500"
                }`}
              >
                <i className="fa-solid fa-thumbs-down text-xl"></i>
              </button>
              <button
                onClick={() => handleRate(img.id, true)}
                className={`w-14 h-14 backdrop-blur-md rounded-full text-white transition-colors ${
                  img.status === "liked" ? "bg-blue-600" : "bg-white/20 hover:bg-blue-600"
                }`}
              >
                <i className="fa-solid fa-thumbs-up text-xl"></i>
              </button>
            </div>
            {img.status !== "none" && (
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  img.status === "liked" ? "bg-blue-600 text-white" : "bg-red-500 text-white"
                }`}
              >
                {img.status}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default GenerateGrid;
