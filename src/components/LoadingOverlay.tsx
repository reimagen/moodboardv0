import React from "react";

type LoadingOverlayProps = {
  message?: string;
  subtext?: string;
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = "Gemini is Synthesizing Vision...",
  subtext = "Processing high-fidelity visual context",
}) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 text-center px-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 animate-pulse">{message}</p>
      <p className="text-[10px] text-gray-400 mt-2 italic">{subtext}</p>
    </div>
  </div>
);

export default LoadingOverlay;
