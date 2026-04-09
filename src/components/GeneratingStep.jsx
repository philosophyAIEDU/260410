import React, { useEffect, useState, useRef } from 'react';
import {
  analyzeProposalStructure,
  generateProposalHtml,
  processProposalImages,
} from '../lib/gemini';

const STAGES = [
  { key: 'analyze', label: '참고 양식 분석 중', icon: '🔍' },
  { key: 'generate', label: '제안서 내용 생성 중', icon: '✍️' },
  { key: 'images', label: '이미지 생성 중', icon: '🎨' },
  { key: 'done', label: '완료', icon: '✅' },
];

export default function GeneratingStep({ apiKey, reference, details, onComplete, onBack }) {
  const [stage, setStage] = useState(0); // index into STAGES
  const [subStatus, setSubStatus] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
  }, []);

  async function run() {
    try {
      // Stage 0: Analyze
      setStage(0);
      setProgress(5);
      let referenceContent;
      if (reference.type === 'text') {
        referenceContent = reference.text;
      } else {
        referenceContent = { mimeType: reference.mimeType, data: reference.data };
      }
      setSubStatus('구조 및 스타일 파악 중...');
      const analysis = await analyzeProposalStructure(apiKey, referenceContent);
      setProgress(35);

      // Stage 1: Generate HTML
      setStage(1);
      setSubStatus('내용을 작성하고 HTML을 생성 중...');
      setProgress(40);
      const html = await generateProposalHtml(apiKey, analysis, details);
      setProgress(70);

      // Stage 2: Images
      setStage(2);
      setSubStatus('');
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const imgCount = doc.querySelectorAll('img[data-generate="true"]').length;

      let finalHtml;
      if (imgCount > 0) {
        finalHtml = await processProposalImages(apiKey, html, (msg) => {
          setSubStatus(msg);
          setProgress((p) => Math.min(p + Math.floor(25 / imgCount), 95));
        });
      } else {
        finalHtml = html;
      }

      setProgress(100);
      setStage(3);
      setSubStatus('');
      setTimeout(() => onComplete(finalHtml), 600);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">생성 중 오류 발생</h3>
              <p className="text-sm text-slate-500 break-all">{error}</p>
            </div>
            <button onClick={onBack} className="btn-secondary">
              이전으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">제안서 생성 중...</h2>
          <p className="text-sm text-slate-500 mt-1">잠시만 기다려 주세요. AI가 제안서를 작성하고 있습니다.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-slate-500">진행률</span>
            <span className="text-xs font-medium text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {STAGES.map((s, idx) => {
            const isDone = idx < stage;
            const isActive = idx === stage;
            const isPending = idx > stage;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 border border-blue-100' : 'bg-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all ${
                    isDone
                      ? 'bg-green-100 text-green-600'
                      : isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="text-xs">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isDone ? 'text-slate-400 line-through' : isActive ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </p>
                  {isActive && subStatus && (
                    <p className="text-xs text-blue-500 mt-0.5 truncate">{subStatus}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
