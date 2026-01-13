import { useState } from 'react';
import { generateAestheticGuide } from '@/services/aestheticGuide';
import { generateAestheticGuideTest } from '@/services/aestheticGuideTest';

interface AestheticGuideParams {
    moodboard: string[];
    productAnalysis: string;
    brandAnalysis: string;
    brandName: string;
}

export const useAestheticGuide = (useTestFlows: boolean) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateSummary = async (params: AestheticGuideParams) => {
        setIsGenerating(true);
        try {
            const text = useTestFlows
                ? await generateAestheticGuideTest({
                    productAnalysis: params.productAnalysis,
                    brandAnalysis: params.brandAnalysis,
                    brandName: params.brandName,
                })
                : await generateAestheticGuide(params.moodboard, {
                    productAnalysis: params.productAnalysis,
                    brandAnalysis: params.brandAnalysis,
                    brandName: params.brandName,
                });
            setSummary(text);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        summary,
        isGenerating,
        handleGenerateSummary,
    };
};
