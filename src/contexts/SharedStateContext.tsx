
import React, { createContext, useState, useContext } from 'react';
import { AppStep } from '../types';
import { useTestMode } from '../hooks/useTestMode';

interface SharedState {
    step: AppStep;
    loading: boolean;
    stepHint: string | null;
    useTestFlows: boolean;
    setStep: (step: AppStep) => void;
    setLoading: (loading: boolean) => void;
    setStepHint: (hint: string | null) => void;
    setUseTestFlows: (useTestFlows: boolean) => void;
    reset: () => void;
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

export const SharedStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [step, setStep] = useState<AppStep>(AppStep.ANALYZE_AESTHETIC);
    const [loading, setLoading] = useState(false);
    const [stepHint, setStepHint] = useState<string | null>(null);
    const { useTestFlows, setUseTestFlows } = useTestMode();

    const reset = () => {
        window.location.reload();
    }

    const value = {
        step,
        loading,
        stepHint,
        useTestFlows,
        setStep,
        setLoading,
        setStepHint,
        setUseTestFlows,
        reset
    };

    return (
        <SharedStateContext.Provider value={value}>
            {children}
        </SharedStateContext.Provider>
    );
};

export const useSharedState = () => {
    const context = useContext(SharedStateContext);
    if (context === undefined) {
        throw new Error('useSharedState must be used within a SharedStateProvider');
    }
    return context;
};
