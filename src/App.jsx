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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none tracking-tight">제안서 생성기</h1>
              <p className="text-xs text-slate-400 mt-0.5">Powered by Gemini AI</p>
            </div>
          </div>
          {currentStep > 0 && (
            <button
              onClick={handleFullReset}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-slate-800 border border-transparent hover:border-slate-700"
            >
              처음부터 다시
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero — shown only on step 0 */}
        {currentStep === 0 && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              AI 제안서 자동 생성
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              제안서를 AI로 자동 생성하세요
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
              참고 양식을 업로드하면 Gemini AI가 동일한 스타일과 구조로 새 제안서를 작성해드립니다.
            </p>
          </div>
        )}

        {/* Step indicator — shown for steps 1–3 */}
        {currentStep >= 1 && currentStep < 4 && (
          <div className="mb-10">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>
        )}

        <div>
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
