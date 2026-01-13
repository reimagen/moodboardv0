import { useState } from 'react';
import { GenerationResult } from '../types';
import { generateProImage } from '@/services/gemini/imageGenerationClient';
import { editImageWithPrompt } from '@/services/gemini/imageRemixClient';

interface GenerationParams {
    productImage: string | undefined;
    brandName: string;
    brandAnalysis: string;
    selectedRefs: string[];
}

export const useMoodboardGeneration = () => {
    const [generatedImages, setGeneratedImages] = useState<GenerationResult[]>([]);
    const [moodboard, setMoodboard] = useState<string[]>([]);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageSize, setImageSize] = useState('1K');
    const [editPrompt, setEditPrompt] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const startGeneration = async ({ productImage, brandName, brandAnalysis, selectedRefs }: GenerationParams) => {
        if (!productImage || selectedRefs.length < 5) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const results: GenerationResult[] = [];
            const context = `Combining ${brandName} aesthetic with the visual style of these reference images. Key brand features: ${brandAnalysis.substring(0, 400)}`;

            const batchSize = 6;
            for (let i = 0; i < batchSize; i++) {
                const url = await generateProImage(productImage, context, { aspectRatio, imageSize });
                results.push({ id: Math.random().toString(), url, status: 'none' });
            }
            setGeneratedImages(results);
        } catch (err) {
            console.error(err);
            const placeholders: GenerationResult[] = Array.from({ length: 6 }, (_, i) => ({
                id: `fallback-${i}`,
                url: `https://picsum.photos/seed/${brandName || 'mood'}-${i}/1200/1200`,
                status: 'none' as const
            }));
            setGeneratedImages(placeholders);
            setGenerationError("Generation failed; showing placeholder images for testing.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRate = (id: string, liked: boolean) => {
        setGeneratedImages(prev => {
            const updated = prev.map(img => {
                if (img.id !== id) return img;
                const prevStatus = img.status;
                let newStatus: GenerationResult['status'] = liked ? 'liked' : 'disliked';
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
        setIsGenerating(true);
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
            setIsGenerating(false);
        }
    };

    const handleRemoveMoodboardItem = (index: number) => {
        setMoodboard(m => m.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
            setEditPrompt('');
        }
    };

    return {
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
        handleRemoveMoodboardItem,
    };
};
