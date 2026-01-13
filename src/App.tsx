import React from 'react';
import { AppStep } from './types';
import UploadStep from './components/UploadStep';
import BrandSearchStep from './components/BrandSearchStep';
import ReferenceSelectionStep from './components/ReferenceSelectionStep';
import ConfigPanel from './components/ConfigPanel';
import GenerateGrid from './components/GenerateGrid';
import MoodboardSection from './components/MoodboardSection';
import LoadingOverlay from './components/LoadingOverlay';
import StepBreadcrumb from './components/StepBreadcrumb';
import AppProviders from './contexts/AppProviders';
import { useFlowManager } from './hooks/useFlowManager';


const StepBlocker: React.FC<{ hint: string | null }> = ({ hint }) => (
  <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
    {hint || "This step is not ready yet. Complete previous steps to proceed."}
  </div>
);

const App: React.FC = () => {
  const { step, loading, stepHint, useTestFlows, setUseTestFlows, isStepReady, getStepHint, reset } = useFlowManager();

  const renderStepContent = () => {
    // Shared blocking logic
    if (step !== AppStep.UPLOAD && !isStepReady(step)) {
      return <StepBlocker hint={stepHint || getStepHint(step)} />;
    }

    switch (step) {
      case AppStep.UPLOAD:
        return (
          <UploadStep />
        );

      case AppStep.BRAND_SEARCH:
        return (
          <BrandSearchStep />
        );

      case AppStep.SELECT_REFERENCES:
        return (
          <ReferenceSelectionStep />
        );

      case AppStep.GENERATE:
      case AppStep.MOODBOARD:
        return (
          <div className="grid lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 space-y-8">
              <ConfigPanel />
            </aside>

            <main className="lg:col-span-3 space-y-12">
              {step === AppStep.GENERATE && (
                <GenerateGrid />
              )}

              <MoodboardSection />
            </main>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-black">
            AESTHETIC<span className="text-blue-600">AI</span>
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">
            Pro Moodboard Engine
          </p>
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
          <StepBreadcrumb />
          {step !== AppStep.UPLOAD && (
            <button
              onClick={reset}
              className="text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              Reset Session
            </button>
          )}
        </div>
      </header>

      {loading && <LoadingOverlay />}

      {renderStepContent()}
    </div>
  );
};

const AppWrapper: React.FC = () => (
    <AppProviders>
        <App />
    </AppProviders>
);

export default AppWrapper;

