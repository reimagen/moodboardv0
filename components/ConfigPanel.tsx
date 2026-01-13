import React from "react";

type ConfigPanelProps = {
  aspectRatio: string;
  imageSize: string;
  moodboardCount: number;
  summary?: string | null;
  onSetAspectRatio: (value: string) => void;
  onSetImageSize: (value: string) => void;
  onRegenerate: () => void;
  onSynthesize: () => void;
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  aspectRatio,
  imageSize,
  moodboardCount,
  summary,
  onSetAspectRatio,
  onSetImageSize,
  onRegenerate,
  onSynthesize,
}) => (
  <div className="glass-card p-6 rounded-3xl space-y-6 sticky top-8">
    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Generation Config</h3>

    <div className="space-y-4">
      <label className="block text-sm font-medium">Aspect Ratio</label>
      <div className="grid grid-cols-2 gap-2">
        {["1:1", "16:9", "9:16", "4:3"].map((r) => (
          <button
            key={r}
            onClick={() => onSetAspectRatio(r)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              aspectRatio === r ? "bg-black text-white border-black" : "border-gray-100 hover:border-gray-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <label className="block text-sm font-medium">Resolution</label>
      <div className="grid grid-cols-3 gap-2">
        {["1K", "2K", "4K"].map((s) => (
          <button
            key={s}
            onClick={() => onSetImageSize(s)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              imageSize === s ? "bg-black text-white border-black" : "border-gray-100 hover:border-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>

    <button
      onClick={onRegenerate}
      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
    >
      Regenerate Batch
    </button>

    <div className="pt-6 border-t border-gray-100">
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">Moodboard Progress</p>
      <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${Math.min((moodboardCount / 5) * 100, 100)}%` }}
        ></div>
      </div>
      <p className="text-right text-xs mt-1 font-bold">{moodboardCount}/5 minimum</p>
    </div>

    {moodboardCount >= 5 && !summary && (
      <button
        onClick={onSynthesize}
        className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors animate-bounce"
      >
        Synthesize Manifesto
      </button>
    )}
  </div>
);

export default ConfigPanel;
