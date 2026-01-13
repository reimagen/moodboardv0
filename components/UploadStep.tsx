import React, { useRef } from "react";

type UploadStepProps = {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onUseDefault?: () => void;
};

const UploadStep: React.FC<UploadStepProps> = ({ onUpload, onUseDefault }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  const handleUseDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUseDefault?.();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="glass-card p-20 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer relative group"
        onClick={handleCardClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={onUpload}
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
          {onUseDefault && (
            <div className="pt-6">
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
      </div>
    </div>
  );
};

export default UploadStep;
