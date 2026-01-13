import React from "react";

type BrandSearchStepProps = {
  productImage?: string;
  productAnalysis: string;
  brandName: string;
  onBrandNameChange: (value: string) => void;
  onSearch: () => Promise<void> | void;
};

const BrandSearchStep: React.FC<BrandSearchStepProps> = ({
  productImage,
  productAnalysis,
  brandName,
  onBrandNameChange,
  onSearch,
}) => (
  <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
    <div className="space-y-8">
      <div className="glass-card p-6 rounded-3xl overflow-hidden shadow-2xl">
        {productImage && (
          <img
            src={productImage}
            className="w-full h-auto rounded-2xl shadow-lg mb-6 border border-gray-100"
            alt="Uploaded product"
          />
        )}
        <div className="prose prose-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Pro Visual Analysis</h3>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm italic">"{productAnalysis}"</p>
        </div>
      </div>
    </div>
    <div className="space-y-8 sticky top-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tighter leading-tight">
          Define Your <br />
          <span className="text-blue-600 underline underline-offset-8">Aesthetic Anchor.</span>
        </h2>
        <p className="text-gray-500">Search for a brand whose visual language you want to inherit. We'll extract its style DNA.</p>
      </div>
      <div className="relative">
        <input
          type="text"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          placeholder="e.g., Apple, Prada, Rimowa..."
          className="w-full bg-white border-2 border-gray-100 p-6 rounded-2xl text-xl focus:outline-none focus:border-blue-600 transition-all shadow-lg"
        />
        <button
          onClick={onSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-black transition-colors"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
);

export default BrandSearchStep;
