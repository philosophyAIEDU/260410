import React, { useState } from 'react';
import StepIndicator from './components/StepIndicator';
import ApiKeyStep from './components/ApiKeyStep';
import UploadStep from './components/UploadStep';
import DetailsStep from './components/DetailsStep';
import GeneratingStep from './components/GeneratingStep';
import ProposalViewer from './components/ProposalViewer';

const STEPS = ['API 키 설정', '참고 양식 업로드', '제안 정보 입력', '제안서 생성', '결과 확인'];

const defaultDetails = {
  projectName: '',
  clientName: '',
  projectDescription: '',
  objectives: '',
  budget: '',
  timeline: '',
  teamInfo: '',
  additionalInfo: '',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('gemini_api_key') || '');
  const [reference, setReference] = useState(null);
  const [details, setDetails] = useState(defaultDetails);
  const [generatedHtml, setGeneratedHtml] = useState('');

  const go = (step) => setCurrentStep(step);

  function handleApiKeyNext(key) {
    sessionStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    go(1);
  }

  function handleReferenceNext(ref) {
    setReference(ref);
    go(2);
  }

  function handleDetailsNext(det) {
    setDetails(det);
    go(3);
  }

  function handleGenerationComplete(html) {
    setGeneratedHtml(html);
    go(4);
  }

  function handleReset() {
    setReference(null);
    setDetails(defaultDetails);
    setGeneratedHtml('');
    go(1);
  }

  function handleFullReset() {
    sessionStorage.removeItem('gemini_api_key');
    setApiKey('');
    setReference(null);
    setDetails(defaultDetails);
    setGeneratedHtml('');
    go(0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">제안서 생성기</h1>
              <p className="text-xs text-slate-400 mt-0.5">Powered by Gemini</p>
            </div>
          </div>
          {currentStep > 0 && (
            <button
              onClick={handleFullReset}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              처음부터 다시
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {currentStep < 4 && (
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        )}

        <div className={currentStep < 4 ? 'mt-8' : ''}>
          {currentStep === 0 && (
            <ApiKeyStep initialKey={apiKey} onNext={handleApiKeyNext} />
          )}
          {currentStep === 1 && (
            <UploadStep
              onNext={handleReferenceNext}
              onBack={() => go(0)}
            />
          )}
          {currentStep === 2 && (
            <DetailsStep
              initialDetails={details}
              onNext={handleDetailsNext}
              onBack={() => go(1)}
            />
          )}
          {currentStep === 3 && (
            <GeneratingStep
              apiKey={apiKey}
              reference={reference}
              details={details}
              onComplete={handleGenerationComplete}
              onBack={() => go(2)}
            />
          )}
          {currentStep === 4 && (
            <ProposalViewer
              html={generatedHtml}
              projectName={details.projectName}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
