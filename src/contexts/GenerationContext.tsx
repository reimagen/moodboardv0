
import React, { createContext, useContext, useEffect } from 'react';
import { useMoodboardGeneration } from '../hooks/useMoodboardGeneration';
import { useSharedState } from './SharedStateContext';
import { useProduct } from './ProductContext';
import { useBrandSearchState } from './BrandSearchContext';
import { AppStep, GenerationResult } from '../types';

interface GenerationParams {
    productImage: string | undefined;
    brandName: string;
    brandAnalysis: string;
    selectedRefs: string[];
}

interface GenerationContextType {
    generatedImages: GenerationResult[];
    moodboard: string[];
    generationError: string | null;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    imageSize: string;
    setImageSize: (size: string) => void;
    editPrompt: string;
    setEditPrompt: (prompt: string) => void;
    editingIndex: number | null;
    setEditingIndex: (index: number | null) => void;
    isGenerating: boolean;
    startGeneration: (params: GenerationParams) => Promise<void>;
    handleRate: (id: string, liked: boolean) => void;
    handleRemix: (index: number) => Promise<void>;
    handleRemoveMoodboardItem: (index: number) => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setLoading, setStep } = useSharedState();
    const { product } = useProduct();
    const { brandName, brandAnalysis, selectedRefs } = useBrandSearchState();
    const { 
        generatedImages, 
        moodboard, 
        generationError, 
        aspectRatio, 
        setAspectRatio, 
        imageSize, 
        setImageSize, 
        editPrompt, 
        setEditPrompt, 
        editingIndex, 
        setEditingIndex, 
        isGenerating, 
        startGeneration, 
        handleRate, 
        handleRemix, 
        handleRemoveMoodboardItem 
    } = useMoodboardGeneration();

    useEffect(() => {
        setLoading(isGenerating);
    }, [isGenerating, setLoading]);

    const startGenerationAndNavigate = async () => {
        await startGeneration({
            productImage: product?.image,
            brandName,
            brandAnalysis,
            selectedRefs
        });
        if (generatedImages.length > 0) {
            setStep(AppStep.GENERATE);
        }
    }

    return (
        <GenerationContext.Provider value={{ 
            generatedImages, 
            moodboard, 
            generationError, 
            aspectRatio, 
            setAspectRatio, 
            imageSize, 
            setImageSize, 
            editPrompt, 
            setEditPrompt, 
            editingIndex, 
            setEditingIndex, 
            isGenerating, 
            startGeneration: startGenerationAndNavigate, 
            handleRate, 
            handleRemix, 
            handleRemoveMoodboardItem 
        }}>
            {children}
        </GenerationContext.Provider>
    );
};

export const useGeneration = () => {
    const context = useContext(GenerationContext);
    if (context === undefined) {
        throw new Error('useGeneration must be used within a GenerationProvider');
    }
    return context;
};
