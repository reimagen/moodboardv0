
import React from 'react';
import { SharedStateProvider } from './SharedStateContext';
import { ProductProvider } from './ProductContext';
import { BrandSearchProvider } from './BrandSearchContext';
import { GenerationProvider } from './GenerationContext';
import { AestheticGuideProvider } from './AestheticGuideContext';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SharedStateProvider>
        <ProductProvider>
            <BrandSearchProvider>
                <GenerationProvider>
                    <AestheticGuideProvider>
                        {children}
                    </AestheticGuideProvider>
                </GenerationProvider>
            </BrandSearchProvider>
        </ProductProvider>
    </SharedStateProvider>
);

export default AppProviders;
