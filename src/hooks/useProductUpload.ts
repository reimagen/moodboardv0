import React, { useState } from 'react';
import { ProductData } from '../types';
import { analyzeProductImage } from '@/services/gemini/productAnalysisClient';
import { analyzeProductImageTest } from '@/services/gemini/productAnalysisClientTest';
import { defaultProduct } from '../constants/defaultProduct';

export const useProductUpload = (useTestFlows: boolean) => {
    const [product, setProduct] = useState<ProductData | null>(null);
    const [productAnalysis, setProductAnalysis] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setProduct({ id: Date.now().toString(), image: base64 });
            setIsUploading(true);
            try {
                const analysis = useTestFlows
                    ? await analyzeProductImageTest(base64)
                    : await analyzeProductImage(base64);
                setProductAnalysis(analysis);
            } catch (err) {
                console.error("Product analysis failed:", err);
                // Optionally reset product if analysis fails
                setProduct(null);
                setProductAnalysis('');
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const useDefaultProduct = () => {
        setProduct({ id: "default", image: defaultProduct.image });
        setProductAnalysis(defaultProduct.analysis);
    };

    return {
        product,
        productAnalysis,
        isUploading,
        handleFileUpload,
        useDefaultProduct,
    };
};
