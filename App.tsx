import React, { useState } from 'react';
import { AppStep, ProductData, GenerationResult } from './types';
import { searchBrandReferences } from './clients/gemini/brandSearchClient';
import { generateProImage } from './clients/gemini/imageGenerationClient';
import { generateAestheticGuide } from './actions/aestheticGuide';
import { generateAestheticGuideTest } from './actions/aestheticGuideTest';
import { analyzeProductImage } from './clients/gemini/productAnalysisClient';
import { analyzeProductImageTest } from './clients/gemini/productAnalysisClientTest';
import { editImageWithPrompt } from './clients/gemini/imageRemixClient';
import UploadStep from './components/UploadStep';
import BrandSearchStep from './components/BrandSearchStep';
import ReferenceSelectionStep from './components/ReferenceSelectionStep';
import ConfigPanel from './components/ConfigPanel';
import GenerateGrid from './components/GenerateGrid';
import MoodboardSection from './components/MoodboardSection';
import LoadingOverlay from './components/LoadingOverlay';
import StepBreadcrumb from './components/StepBreadcrumb';
import { defaultProduct } from './constants/defaultProduct';
import { useTestMode } from './hooks/useTestMode';

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
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { useTestFlows, setUseTestFlows } = useTestMode();
  const [stepHint, setStepHint] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [editPrompt, setEditPrompt] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const isStepReady = (target: AppStep) => {
    switch (target) {
      case AppStep.UPLOAD:
        return true;
      case AppStep.BRAND_SEARCH:
        return Boolean(product);
      case AppStep.SELECT_REFERENCES:
        return brandRefs.length > 0;
      case AppStep.GENERATE:
        return generatedImages.length > 0;
      case AppStep.MOODBOARD:
        return moodboard.length > 0 || summary !== null;
      default:
        return false;
    }
  };

  const getStepHint = (target: AppStep) => {
    switch (target) {
      case AppStep.BRAND_SEARCH:
        return "You must upload and analyze a product before brand search.";
      case AppStep.SELECT_REFERENCES:
        return "You must search a brand to load references.";
      case AppStep.GENERATE:
        return "You must select at least 5 references and start generation.";
      case AppStep.MOODBOARD:
        return "You must generate images and synthesize a manifesto.";
      default:
        return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setProduct({ id: Date.now().toString(), image: base64 });
        setLoading(true);
        try {
          const analysis = useTestFlows
            ? await analyzeProductImageTest(base64)
            : await analyzeProductImage(base64);
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

  const useDefaultProduct = () => {
    setProduct({ id: "default", image: defaultProduct.image });
    setProductAnalysis(defaultProduct.analysis);
    setStep(AppStep.BRAND_SEARCH);
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
    setGenerationError(null);
    try {
      const results: GenerationResult[] = [];
      const context = `Combining ${brandName} aesthetic with the visual style of these reference images. Key brand features: ${brandAnalysis.substring(0, 400)}`;

      const batchSize = 6; // generate more so user can hit the 5-minimum moodboard
      for (let i = 0; i < batchSize; i++) {
        const url = await generateProImage(product.image, context, { aspectRatio, imageSize });
        results.push({ id: Math.random().toString(), url, status: 'none' });
      }
      setGeneratedImages(results);
    } catch (err) {
      console.error(err);
      // Fallback placeholders so the user can continue testing the flow
      const placeholders: GenerationResult[] = Array.from({ length: 6 }, (_, i) => ({
        id: `fallback-${i}`,
        url: `https://picsum.photos/seed/${brandName || 'mood'}-${i}/1200/1200`,
        status: 'none'
      }));
      setGeneratedImages(placeholders);
      setGenerationError("Generation failed; showing placeholder images for testing.");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (id: string, liked: boolean) => {
    setGeneratedImages(prev => {
      const updated = prev.map(img => {
        if (img.id !== id) return img;
        const prevStatus = img.status;
        let newStatus: GenerationResult['status'] = liked ? 'liked' : 'disliked';
        // Toggle off if same action is repeated
        if ((liked && prevStatus === 'liked') || (!liked && prevStatus === 'disliked')) {
          newStatus = 'none';
        }
        return { ...img, status: newStatus };
      });
      const likedUrls = updated.filter(img => img.status === 'liked').map(img => img.url);
      setMoodboard(Array.from(new Set(likedUrls)));
      return updated;
    });
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

  const handleRemoveMoodboardItem = (index: number) => {
    setMoodboard(m => m.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditPrompt('');
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const text = useTestFlows
        ? await generateAestheticGuideTest({
            productAnalysis,
            brandAnalysis,
            brandName,
          })
        : await generateAestheticGuide(moodboard, {
            productAnalysis,
            brandAnalysis,
            brandName,
          });
      setSummary(text);
      setStep(AppStep.MOODBOARD);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepBlocker = (hint: string | null) => (
    <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
      {hint || "This step is not ready yet. Complete previous steps to proceed."}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-black">AESTHETIC<span className="text-blue-600">AI</span></h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">Pro Moodboard Engine</p>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-gray-500 mt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-gray-600">Test Mode</span>
              <input
                type="checkbox"
                checked={useTestFlows}
                onChange={(e) => setUseTestFlows(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <StepBreadcrumb
            currentStep={step}
            onNavigate={(target) => {
              setStepHint(null);
              if (!isStepReady(target)) {
                setStepHint(getStepHint(target));
              }
              setStep(target);
            }}
          />
          {step !== AppStep.UPLOAD && (
            <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">Reset Session</button>
          )}
        </div>
      </header>

      {loading && <LoadingOverlay />}

      {step === AppStep.UPLOAD && <UploadStep onUpload={handleFileUpload} onUseDefault={useDefaultProduct} />}

      {step === AppStep.BRAND_SEARCH &&
        (isStepReady(AppStep.BRAND_SEARCH) ? (
          <BrandSearchStep
            productImage={product?.image}
            productAnalysis={productAnalysis}
            brandName={brandName}
            onBrandNameChange={setBrandName}
            onSearch={handleBrandSearch}
          />
        ) : (
          renderStepBlocker(stepHint || getStepHint(AppStep.BRAND_SEARCH))
        ))}

      {step === AppStep.SELECT_REFERENCES &&
        (isStepReady(AppStep.SELECT_REFERENCES) ? (
          <ReferenceSelectionStep
            brandName={brandName}
            brandRefs={brandRefs}
            selectedRefs={selectedRefs}
            onToggleReference={toggleReference}
            onGenerate={startGeneration}
            onRefresh={handleBrandSearch}
          />
        ) : (
          renderStepBlocker(stepHint || getStepHint(AppStep.SELECT_REFERENCES))
        ))}

      {(step === AppStep.GENERATE || step === AppStep.MOODBOARD) &&
        (isStepReady(step) ? (
          <div className="grid lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 space-y-8">
              <ConfigPanel
                aspectRatio={aspectRatio}
                imageSize={imageSize}
                moodboardCount={moodboard.length}
                summary={summary}
                onSetAspectRatio={setAspectRatio}
                onSetImageSize={setImageSize}
                onRegenerate={startGeneration}
                onSynthesize={handleGenerateSummary}
              />
            </aside>

            <main className="lg:col-span-3 space-y-12">
              {step === AppStep.GENERATE && (
                <GenerateGrid
                  generatedImages={generatedImages}
                  onRate={handleRate}
                  onChangeReferences={() => setStep(AppStep.SELECT_REFERENCES)}
                  errorMessage={generationError || undefined}
                />
              )}

              <MoodboardSection
                title={step === AppStep.MOODBOARD ? "Aesthetics Guide" : "Brand Moodboard"}
                summary={summary}
                moodboard={moodboard}
                editingIndex={editingIndex}
                editPrompt={editPrompt}
                onSetEditPrompt={setEditPrompt}
                onSetEditingIndex={setEditingIndex}
                onRemix={handleRemix}
                onRemove={handleRemoveMoodboardItem}
              />
            </main>
          </div>
        ) : (
          renderStepBlocker(stepHint || getStepHint(step))
        ))}
    </div>
  );
};

export default App;
