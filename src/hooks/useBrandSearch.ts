import { useState } from 'react';
import { searchBrandReferences } from '@/services/gemini/brandSearchClient';

export const useBrandSearch = () => {
    const [brandName, setBrandName] = useState('');
    const [brandAnalysis, setBrandAnalysis] = useState('');
    const [brandRefs, setBrandRefs] = useState<string[]>([]);
    const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleBrandSearch = async () => {
        if (!brandName) return;
        setIsSearching(true);
        try {
            const { urls, analysis } = await searchBrandReferences(brandName);
            setBrandRefs(urls);
            setBrandAnalysis(analysis);
        } catch (err) {
            console.error("Brand search failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleReference = (url: string) => {
        setSelectedRefs(prev =>
            prev.includes(url) ? prev.filter(r => r !== url) : [...prev, url]
        );
    };

    return {
        brandName,
        setBrandName,
        brandAnalysis,
        brandRefs,
        selectedRefs,
        setSelectedRefs,
        isSearching,
        handleBrandSearch,
        toggleReference,
    };
};
