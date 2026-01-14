import React, { useRef } from "react";
import { useProduct } from "../contexts/ProductContext";
import { useFlowManager } from "../hooks/useFlowManager";
import { AppStep } from "../types";

const UploadStep: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileUpload, useDefaultProduct, product, productAnalysis } = useProduct();
  const { navigate } = useFlowManager(); // Added navigate from useFlowManager

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  const handleUseDefault = (e: React.MouseEvent) => {
    // No stopPropagation needed here, as the button is now outside the main upload card
    useDefaultProduct();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!product ? (
        <div className="space-y-4"> {/* Added a div to wrap the card and button */}
          <div
            className="glass-card p-20 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer relative group"
            onClick={handleCardClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-inner">
                <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Product</h2>
                <p className="text-gray-400 mt-2 italic max-w-sm mx-auto">Identify design DNA and start the mapping process.</p>
              </div>
            </div>
          </div>
          {useDefaultProduct && (
            <div className="pt-6 text-center"> {/* Added text-center for alignment */}
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 underline underline-offset-4"
              >
                Use Sample Product
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Product Image and Change Product */}
          <div>
            <div className="glass-card p-6 rounded-3xl overflow-hidden shadow-2xl mb-8">
              {product?.image && (
                <img
                  src={product.image}
                  className="w-full h-auto rounded-2xl shadow-lg border border-gray-100"
                  alt="Uploaded product"
                />
              )}
            </div>

            {/* Small container for Change Product */}
            <div
              className="glass-card p-6 rounded-3xl text-center border-2 border-dashed border-gray-200 relative group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <i className="fa-solid fa-file-arrow-up text-xl"></i>
                </div>
                <h3 className="text-md font-bold text-gray-900">Change Product</h3>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={handleCardClick}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              ></button>
            </div>
          </div>

          {/* Right Column: Analysis and CTA */}
          <div className="space-y-8 sticky top-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter leading-tight">
                Your <br />
                <span className="text-blue-600 underline underline-offset-8">Aesthetic Anchor.</span>
              </h2>
            </div>
            <div className="glass-card p-6 rounded-3xl shadow-2xl">
              <div className="prose prose-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Pro Visual Analysis</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm italic">"{productAnalysis}"</p>
              </div>
            </div>
            <button
              onClick={() => navigate(AppStep.FIND_INSPIRATION)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
            >
              Find Inspiration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStep;
