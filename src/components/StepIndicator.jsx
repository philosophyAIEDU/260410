import React from 'react';

export default function StepIndicator({ steps, currentStep }) {
  // Skip the first step (API key) — shown as separate hero page
  const displaySteps = steps.slice(1);
  const displayCurrent = currentStep - 1;

  return (
    <div className="w-full">
      {/* Mobile: progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-600">{steps[currentStep]}</span>
          <span className="text-xs text-slate-400 font-medium tabular-nums">
            {currentStep} / {steps.length - 1}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: step dots */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {displaySteps.map((step, idx) => {
          const done = idx < displayCurrent;
          const active = idx === displayCurrent;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done
                      ? 'bg-blue-600 text-white'
                      : active
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    active ? 'text-blue-600' : done ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {idx < displaySteps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-3 mb-6 transition-all duration-500 ${
                    idx < displayCurrent ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
