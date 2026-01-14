
import React from 'react';
import { SharedStateProvider } from './SharedStateContext';
import { ProductProvider } from './ProductContext';
import { BrandSearchProvider } from './BrandSearchContext';
import { GenerationProvider } from './GenerationContext';
import { AestheticGuideProvider } from './AestheticGuideContext';
import { BrandSuggestionProvider } from './BrandSuggestionContext'; // New import

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SharedStateProvider>
        <ProductProvider>
            <BrandSuggestionProvider> {/* New provider here */}
                <BrandSearchProvider>
                    <GenerationProvider>
                        <AestheticGuideProvider>
                            {children}
                        </AestheticGuideProvider>
                    </GenerationProvider>
                </BrandSearchProvider>
            </BrandSuggestionProvider>
        </ProductProvider>
    </SharedStateProvider>
);

export default AppProviders;
