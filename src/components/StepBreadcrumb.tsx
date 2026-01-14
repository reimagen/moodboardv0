import React from "react";
import { AppStep } from "../types";
import { useFlowManager } from "../hooks/useFlowManager";

const steps: { key: AppStep; label: string }[] = [
  { key: AppStep.ANALYZE_AESTHETIC, label: "Analyze Aesthetic" },
  { key: AppStep.FIND_INSPIRATION, label: "Find Inspiration" },
  { key: AppStep.SELECT_REFERENCES, label: "Select References" },
  { key: AppStep.GENERATE, label: "Generate Moodboard" },
  { key: AppStep.MOODBOARD, label: "Aesthetics Guide" },
];

const StepBreadcrumb: React.FC = () => {
  const { step: currentStep, navigate: onNavigate } = useFlowManager();

  return (
    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
      {steps.map((step, idx) => {
        const active = step.key === currentStep;
        const completed = steps.findIndex(s => s.key === currentStep) > idx;
        const clickable = Boolean(onNavigate);
        return (
          <React.Fragment key={step.key}>
            <div
              className={`flex items-center gap-2 ${clickable ? "cursor-pointer" : ""} ${
                active ? "text-blue-600" : completed ? "text-gray-700" : "text-gray-400"
              }`}
              onClick={() => onNavigate?.(step.key)}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : completed
                    ? "border-gray-300 bg-gray-100 text-gray-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                {idx + 1}
              </span>
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && <span className="text-gray-300">/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepBreadcrumb;
