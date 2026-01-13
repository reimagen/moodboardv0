import React from "react";

type MoodboardSectionProps = {
  title?: string;
  summary: string | null;
  moodboard: string[];
  editingIndex: number | null;
  editPrompt: string;
  onSetEditPrompt: (value: string) => void;
  onSetEditingIndex: (index: number | null) => void;
  onRemix: (index: number) => void;
  onRemove: (index: number) => void;
};

const MoodboardSection: React.FC<MoodboardSectionProps> = ({
  title = "Brand Moodboard",
  summary,
  moodboard,
  editingIndex,
  editPrompt,
  onSetEditPrompt,
  onSetEditingIndex,
  onRemix,
  onRemove,
}) => (
  <section className="space-y-6">
    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
      {title}
      <span className="text-xs font-normal text-gray-400">({moodboard.length} assets)</span>
    </h2>

    {summary && (
      <div className="glass-card p-10 rounded-[2rem] border-l-8 border-blue-600 shadow-xl">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Aesthetic Synthesis</h4>
        <p className="text-xl md:text-2xl font-light italic text-gray-800 leading-relaxed">"{summary}"</p>
      </div>
    )}

    {moodboard.length === 0 ? (
      <div className="p-20 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400">
        <p>No images saved to moodboard yet. Like generations to add them here.</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {moodboard.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-shadow">
            <img src={url} className="w-full h-full object-cover" alt="Moodboard asset" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              {editingIndex === i ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={editPrompt}
                    onChange={(e) => onSetEditPrompt(e.target.value)}
                    placeholder="Describe change..."
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg p-2 text-xs focus:outline-none focus:bg-white/20"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => onRemix(i)} className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded font-bold uppercase">
                      Update
                    </button>
                    <button
                      onClick={() => onSetEditingIndex(null)}
                      className="px-2 bg-white/20 text-white text-[10px] py-1 rounded font-bold uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onSetEditingIndex(i)}
                    className="w-full bg-white text-black py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI Remix
                  </button>
                  <button
                    onClick={() => onRemove(i)}
                    className="w-full bg-red-600 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-xmark"></i> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default MoodboardSection;
