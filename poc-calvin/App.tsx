import React, { useState } from 'react';
import { AppStep, ProductData, GenerationResult } from './types';
import { 
  searchBrandReferences, 
  generateProImage, 
  generateAestheticSummary, 
  analyzeProductImage,
  editImageWithPrompt 
} from './services/gemini';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [productAnalysis, setProductAnalysis] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandAnalysis, setBrandAnalysis] = useState('');
  const [brandRefs, setBrandRefs] = useState<string[]>([]);
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GenerationResult[]>([]);
  const [moodboard, setMoodboard] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [editPrompt, setEditPrompt] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setProduct({ id: Date.now().toString(), image: base64 });
        setLoading(true);
        try {
          const analysis = await analyzeProductImage(base64);
          setProductAnalysis(analysis);
          setStep(AppStep.BRAND_SEARCH);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandSearch = async () => {
    if (!brandName) return;
    setLoading(true);
    try {
      const { urls, analysis } = await searchBrandReferences(brandName);
      setBrandRefs(urls);
      setBrandAnalysis(analysis);
      setStep(AppStep.SELECT_REFERENCES);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReference = (url: string) => {
    setSelectedRefs(prev => 
      prev.includes(url) ? prev.filter(r => r !== url) : [...prev, url]
    );
  };

  const startGeneration = async () => {
    if (!product?.image || selectedRefs.length < 5) return;
    setLoading(true);
    setStep(AppStep.GENERATE);
    try {
      const results: GenerationResult[] = [];
      const context = `Combining ${brandName} aesthetic with the visual style of these reference images. Key brand features: ${brandAnalysis.substring(0, 400)}`;
      
      for(let i=0; i<4; i++) {
        const url = await generateProImage(product.image, context, { aspectRatio, imageSize });
        results.push({ id: Math.random().toString(), url, status: 'none' });
      }
      setGeneratedImages(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (id: string, liked: boolean) => {
    setGeneratedImages(prev => prev.map(img => {
      if (img.id === id) {
        const newStatus = liked ? 'liked' : 'disliked';
        if (liked && !moodboard.includes(img.url)) {
          setMoodboard(m => [...m, img.url]);
        }
        return { ...img, status: newStatus as any };
      }
      return img;
    }));
  };

  const handleRemix = async (index: number) => {
    if (!editPrompt) return;
    setLoading(true);
    try {
      const originalUrl = moodboard[index];
      const editedUrl = await editImageWithPrompt(originalUrl, editPrompt);
      const newMoodboard = [...moodboard];
      newMoodboard[index] = editedUrl;
      setMoodboard(newMoodboard);
      setEditPrompt('');
      setEditingIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const text = await generateAestheticSummary(moodboard);
      setSummary(text);
      setStep(AppStep.MOODBOARD);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-black">AESTHETIC<span className="text-blue-600">AI</span></h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">Pro Moodboard Engine</p>
        </div>
        {step !== AppStep.UPLOAD && (
          <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">Reset Session</button>
        )}
      </header>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 text-center px-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 animate-pulse">Gemini is Synthesizing Vision...</p>
            <p className="text-[10px] text-gray-400 mt-2 italic">Processing high-fidelity visual context</p>
          </div>
        </div>
      )}

      {step === AppStep.UPLOAD && (
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-20 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer relative group">
            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
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
        </div>
      )}

      {step === AppStep.BRAND_SEARCH && (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-3xl overflow-hidden shadow-2xl">
              <img src={product?.image} className="w-full h-auto rounded-2xl shadow-lg mb-6 border border-gray-100" alt="Uploaded product" />
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
              <h2 className="text-4xl font-bold tracking-tighter leading-tight">Define Your <br/><span className="text-blue-600 underline underline-offset-8">Aesthetic Anchor.</span></h2>
              <p className="text-gray-500">Search for a brand whose visual language you want to inherit. We'll extract its style DNA.</p>
            </div>
            <div className="relative">
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
          </div>
        </div>
      )}

      {step === AppStep.SELECT_REFERENCES && (
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Select Reference Seed</h2>
            <p className="text-gray-500">Select at least <span className="font-bold text-black">5 images</span> that represent the specific vibe of <span className="text-blue-600 font-bold">{brandName}</span>.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {brandRefs.map((url, i) => (
              <div 
                key={i} 
                onClick={() => toggleReference(url)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${selectedRefs.includes(url) ? 'ring-4 ring-blue-600 scale-[0.98]' : 'hover:scale-[1.02]'}`}
              >
                <img src={url} className="w-full aspect-square object-cover" alt="Brand reference" />
                <div className={`absolute inset-0 bg-blue-600/20 flex items-center justify-center transition-opacity ${selectedRefs.includes(url) ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                   <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                    <i className={`fa-solid ${selectedRefs.includes(url) ? 'fa-check text-blue-600' : 'fa-plus text-gray-400'}`}></i>
                   </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <button 
              disabled={selectedRefs.length < 5}
              onClick={startGeneration}
              className={`px-12 py-5 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-xl ${selectedRefs.length >= 5 ? 'bg-black text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Generate Synthesis ({selectedRefs.length}/5)
            </button>
          </div>
        </div>
      )}

      {(step === AppStep.GENERATE || step === AppStep.MOODBOARD) && (
        <div className="grid lg:grid-cols-4 gap-12">
          <aside className="lg:col-span-1 space-y-8">
            <div className="glass-card p-6 rounded-3xl space-y-6 sticky top-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Generation Config</h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {['1:1', '16:9', '9:16', '4:3'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === r ? 'bg-black text-white border-black' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium">Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1K', '2K', '4K'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setImageSize(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${imageSize === s ? 'bg-black text-white border-black' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={startGeneration}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
              >
                Regenerate Batch
              </button>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">Moodboard Progress</p>
                <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${Math.min((moodboard.length / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs mt-1 font-bold">{moodboard.length}/5 minimum</p>
              </div>

              {moodboard.length >= 5 && !summary && (
                <button 
                  onClick={handleGenerateSummary}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors animate-bounce"
                >
                  Synthesize Manifesto
                </button>
              )}
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-12">
            {step === AppStep.GENERATE && (
              <section className="space-y-6">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-bold tracking-tight">AI Generated Variations</h2>
                  <button onClick={() => setStep(AppStep.SELECT_REFERENCES)} className="text-xs text-blue-600 font-bold uppercase underline underline-offset-4">Change References</button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {generatedImages.map((img) => (
                    <div key={img.id} className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-200 aspect-square">
                      <img src={img.url} className="w-full h-full object-cover" alt="Generated variation" />
                      {img.status === 'none' && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6">
                          <button 
                            onClick={() => handleRate(img.id, false)}
                            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                          >
                            <i className="fa-solid fa-thumbs-down text-xl"></i>
                          </button>
                          <button 
                            onClick={() => handleRate(img.id, true)}
                            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition-colors"
                          >
                            <i className="fa-solid fa-thumbs-up text-xl"></i>
                          </button>
                        </div>
                      )}
                      {img.status !== 'none' && (
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${img.status === 'liked' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                          {img.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Brand Moodboard 
                <span className="text-xs font-normal text-gray-400">({moodboard.length} assets)</span>
              </h2>
              
              {summary && (
                <div className="glass-card p-10 rounded-[2rem] border-l-8 border-blue-600 shadow-xl">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Aesthetic Synthesis</h4>
                   <p className="text-xl md:text-2xl font-light italic text-gray-800 leading-relaxed">
                     "{summary}"
                   </p>
                </div>
              )}

              {moodboard.length === 0 ? (
                <div className="p-20 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400">
                  <p>No images saved to moodboard yet. Like generations to add them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {moodboard.map((url, i) => (
                    <div key={i} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-shadow">
                      <img src={url} className="w-full h-full object-cover" alt="Moodboard asset" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        {editingIndex === i ? (
                          <div className="space-y-2">
                            <input 
                              autoFocus
                              type="text" 
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              placeholder="Describe change..."
                              className="w-full bg-white/10 text-white border border-white/30 rounded-lg p-2 text-xs focus:outline-none focus:bg-white/20"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleRemix(i)} className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded font-bold uppercase">Update</button>
                              <button onClick={() => setEditingIndex(null)} className="px-2 bg-white/20 text-white text-[10px] py-1 rounded font-bold uppercase">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setEditingIndex(i)}
                            className="w-full bg-white text-black py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Remix
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;