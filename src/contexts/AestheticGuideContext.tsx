
import React, { createContext, useContext, useEffect } from 'react';
import { useAestheticGuide } from '../hooks/useAestheticGuide';
import { useSharedState } from './SharedStateContext';
import { useProduct } from './ProductContext';
import { useBrandSearchState } from './BrandSearchContext';
import { useGeneration } from './GenerationContext';
import { AppStep } from '../types';

interface AestheticGuideContextType {
    summary: string | null;
    isGenerating: boolean;
    handleGenerateSummary: () => Promise<void>;
}

const AestheticGuideContext = createContext<AestheticGuideContextType | undefined>(undefined);

export const AestheticGuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { useTestFlows, setLoading, setStep } = useSharedState();
    const { productAnalysis } = useProduct();
    const { brandName, brandAnalysis } = useBrandSearchState();
    const { moodboard } = useGeneration();
    const { summary, isGenerating, handleGenerateSummary } = useAestheticGuide(useTestFlows);

    useEffect(() => {
        setLoading(isGenerating);
    }, [isGenerating, setLoading]);

    const handleGenerateSummaryAndNavigate = async () => {
        await handleGenerateSummary({
            moodboard,
            productAnalysis,
            brandAnalysis,
            brandName,
        });
        if (summary) {
            setStep(AppStep.MOODBOARD);
        }
    }

    return (
        <AestheticGuideContext.Provider value={{ summary, isGenerating, handleGenerateSummary: handleGenerateSummaryAndNavigate }}>
            {children}
        </AestheticGuideContext.Provider>
    );
};

export const useAestheticGuideState = () => {
    const context = useContext(AestheticGuideContext);
    if (context === undefined) {
        throw new Error('useAestheticGuideState must be used within a AestheticGuideProvider');
    }
    return context;
};
