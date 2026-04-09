import React, { useState, useRef } from 'react';
import { fileToBase64, fileToText } from '../lib/gemini';

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WebP',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
};

const TEXT_TYPES = new Set(['text/plain', 'text/markdown', 'text/html']);

export default function UploadStep({ onNext, onBack }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  function acceptFile(f) {
    if (!f) return;
    if (!ACCEPTED_TYPES[f.type] && !f.name.endsWith('.md')) {
      setError('지원하지 않는 파일 형식입니다. PDF, PNG, JPG, WebP, TXT, MD 파일을 업로드해 주세요.');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('파일 크기는 20MB 이하여야 합니다.');
      return;
    }
    setError('');
    setFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  }

  function handleFileChange(e) {
    acceptFile(e.target.files[0]);
    e.target.value = '';
  }

  async function handleNext() {
    setLoading(true);
    setError('');
    try {
      if (mode === 'paste') {
        const text = pasteText.trim();
        if (!text) throw new Error('텍스트를 입력해 주세요.');
        onNext({ type: 'text', text });
      } else {
        if (!file) throw new Error('파일을 선택해 주세요.');
        if (TEXT_TYPES.has(file.type) || file.name.endsWith('.md')) {
          const text = await fileToText(file);
          onNext({ type: 'text', text, filename: file.name });
        } else {
          const data = await fileToBase64(file);
          onNext({ type: 'binary', data, mimeType: file.type, filename: file.name });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canProceed = mode === 'paste' ? pasteText.trim().length > 50 : !!file;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">참고 제안서 양식 업로드</h2>
            <p className="text-sm text-slate-500">기존 제안서를 업로드하거나 텍스트를 붙여넣으세요</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-5">
          {[
            { id: 'upload', label: '파일 업로드' },
            { id: 'paste', label: '텍스트 붙여넣기' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id); setError(''); setFile(null); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'upload' ? (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragging
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · 클릭하여 변경</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, WebP, TXT, MD · 최대 20MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="label">제안서 내용 붙여넣기</label>
            <textarea
              value={pasteText}
              onChange={(e) => { setPasteText(e.target.value); setError(''); }}
              placeholder="참고할 제안서의 내용을 여기에 붙여넣으세요 (최소 50자 이상)..."
              rows={12}
              className="input-field resize-none font-mono text-xs"
            />
            <p className="text-xs text-slate-400 mt-1">{pasteText.length}자</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onBack} className="btn-secondary">
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                처리 중...
              </>
            ) : (
              <>
                다음 단계
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
