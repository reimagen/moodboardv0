
import React, { createContext, useContext, useEffect } from 'react';
import { useProductUpload } from '../hooks/useProductUpload';
import { useSharedState } from './SharedStateContext';
import { ProductData, AppStep } from '../types';

interface ProductContextType {
    product: ProductData | null;
    productAnalysis: string;
    isUploading: boolean;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    useDefaultProduct: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { useTestFlows, setLoading, setStep } = useSharedState();
    const { product, productAnalysis, isUploading, handleFileUpload, useDefaultProduct } = useProductUpload(useTestFlows);

    useEffect(() => {
        setLoading(isUploading);
    }, [isUploading, setLoading]);
    
    const handleFileUploadAction = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await handleFileUpload(e);
    }

    const useDefaultProductAction = () => {
        useDefaultProduct();
    }

    return (
        <ProductContext.Provider value={{ product, productAnalysis, isUploading, handleFileUpload: handleFileUploadAction, useDefaultProduct: useDefaultProductAction }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};
