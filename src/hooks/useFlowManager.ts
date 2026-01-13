
import { useSharedState } from '../contexts/SharedStateContext';
import { useProduct } from '../contexts/ProductContext';
import { useBrandSearchState } from '../contexts/BrandSearchContext';
import { useGeneration } from '../contexts/GenerationContext';
import { useAestheticGuideState } from '../contexts/AestheticGuideContext';
import { AppStep } from '../types';

export const useFlowManager = () => {
    const { step, setStep, stepHint, setStepHint, ...sharedState } = useSharedState();
    const { product } = useProduct();
    const { brandRefs } = useBrandSearchState();
    const { generatedImages, moodboard } = useGeneration();
    const { summary } = useAestheticGuideState();

    const isStepReady = (target: AppStep) => {
        switch (target) {
            case AppStep.UPLOAD:
                return true;
            case AppStep.BRAND_SEARCH:
                return Boolean(product);
            case AppStep.SELECT_REFERENCES:
                return brandRefs.length > 0;
            case AppStep.GENERATE:
                return generatedImages.length > 0;
            case AppStep.MOODBOARD:
                return moodboard.length > 0 || summary !== null;
            default:
                return false;
        }
    };

    const getStepHint = (target: AppStep) => {
        switch (target) {
            case AppStep.BRAND_SEARCH:
                return "You must upload and analyze a product before brand search.";
            case AppStep.SELECT_REFERENCES:
                return "You must search a brand to load references.";
            case AppStep.GENERATE:
                return "You must select at least 5 references and start generation.";
            case AppStep.MOODBOARD:
                return "You must generate images and synthesize an aesthetic guide.";
            default:
                return null;
        }
    };

    const navigate = (target: AppStep) => {
        setStepHint(null);
        if (!isStepReady(target)) {
            setStepHint(getStepHint(target));
        }
        setStep(target);
    };

    return {
        step,
        stepHint,
        isStepReady,
        getStepHint,
        navigate,
        ...sharedState,
    };
};
