
import React, { createContext, useContext, useEffect } from 'react';
import { useBrandSearch } from '../hooks/useBrandSearch';
import { useSharedState } from './SharedStateContext';
import { AppStep } from '../types';

interface BrandSearchContextType {
    brandName: string;
    setBrandName: (name: string) => void;
    brandAnalysis: string;
    brandRefs: string[];
    selectedRefs: string[];
    isSearching: boolean;
    handleBrandSearch: () => Promise<void>;
    toggleReference: (url: string) => void;
}

const BrandSearchContext = createContext<BrandSearchContextType | undefined>(undefined);

export const BrandSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setLoading, setStep } = useSharedState();
    const { brandName, setBrandName, brandAnalysis, brandRefs, selectedRefs, isSearching, handleBrandSearch, toggleReference } = useBrandSearch();

    useEffect(() => {
        setLoading(isSearching);
    }, [isSearching, setLoading]);

    const handleBrandSearchAndNavigate = async () => {
        await handleBrandSearch();
        if (brandRefs.length > 0) {
            setStep(AppStep.SELECT_REFERENCES);
        }
    }

    return (
        <BrandSearchContext.Provider value={{ brandName, setBrandName, brandAnalysis, brandRefs, selectedRefs, isSearching, handleBrandSearch: handleBrandSearchAndNavigate, toggleReference }}>
            {children}
        </BrandSearchContext.Provider>
    );
};

export const useBrandSearchState = () => {
    const context = useContext(BrandSearchContext);
    if (context === undefined) {
        throw new Error('useBrandSearchState must be used within a BrandSearchProvider');
    }
    return context;
};
