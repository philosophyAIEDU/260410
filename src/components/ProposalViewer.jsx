import React, { useRef, useState } from 'react';
import { htmlToDocxBlob } from '../lib/docxExport';

export default function ProposalViewer({ html, projectName, onReset }) {
  const iframeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);

  function handleDownload() {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (projectName || 'proposal').replace(/[^a-zA-Z0-9가-힣_\-]/g, '_');
    a.download = `${safeName}_제안서.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDocxDownload() {
    setDocxLoading(true);
    try {
      const blob = await htmlToDocxBlob(html, projectName || '제안서');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (projectName || 'proposal').replace(/[^a-zA-Z0-9가-힣_\-]/g, '_');
      a.download = `${safeName}_제안서.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Word 변환 실패:', e);
      alert('Word 파일 변환 중 오류가 발생했습니다.');
    } finally {
      setDocxLoading(false);
    }
  }

  function handlePrint() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.contentWindow?.print();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">제안서 생성 완료</h2>
            {projectName && <p className="text-sm text-slate-500">{projectName}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={onReset} className="btn-secondary text-sm py-2 px-4">
            새 제안서 만들기
          </button>
          <button
            onClick={handleCopy}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                복사됨
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                HTML 복사
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            인쇄 / PDF
          </button>
          <button
            onClick={handleDocxDownload}
            disabled={docxLoading}
            className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
          >
            {docxLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                변환 중...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5v-1h7v1h-7zm0-3v-1h7v1h-7zm0-3v-1h4v1h-4z"/>
                </svg>
                Word 다운로드
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            HTML 다운로드
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-xs text-blue-700">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Word 다운로드</strong>로 .docx 파일을 저장하거나, <strong>HTML 다운로드</strong>로 원본을 저장할 수 있습니다.
          PDF로 저장하려면 <strong>인쇄 / PDF</strong> 버튼을 누른 뒤 Chrome에서 "PDF로 저장"을 선택하세요.
        </span>
      </div>

      {/* Proposal Preview */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-slate-400 ml-2 font-mono">proposal-preview</span>
        </div>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="생성된 제안서 미리보기"
          className="w-full"
          style={{ height: '780px', border: 'none' }}
          sandbox="allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}
