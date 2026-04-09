import React, { useState } from 'react';

const FIELDS = [
  {
    id: 'projectName',
    label: '프로젝트명',
    placeholder: '예: ABC 쇼핑몰 리뉴얼 프로젝트',
    required: true,
    type: 'text',
  },
  {
    id: 'clientName',
    label: '클라이언트 / 의뢰 회사명',
    placeholder: '예: (주)테크스타트',
    required: true,
    type: 'text',
  },
  {
    id: 'projectDescription',
    label: '프로젝트 설명',
    placeholder: '프로젝트의 배경, 범위, 주요 내용을 자세히 작성해 주세요.',
    required: true,
    type: 'textarea',
    rows: 4,
  },
  {
    id: 'objectives',
    label: '목표 및 기대효과',
    placeholder: '예: 모바일 전환율 30% 향상, 구매 프로세스 간소화, 브랜드 이미지 개선',
    type: 'textarea',
    rows: 3,
  },
  {
    id: 'budget',
    label: '예산',
    placeholder: '예: 3,000만원 ~ 5,000만원',
    type: 'text',
  },
  {
    id: 'timeline',
    label: '프로젝트 일정',
    placeholder: '예: 2025년 3월 착수 ~ 2025년 8월 완료 (6개월)',
    type: 'text',
  },
  {
    id: 'teamInfo',
    label: '팀 구성 / 담당자 정보',
    placeholder: '예: PM 1명, 디자이너 2명, 개발자 3명으로 구성된 전담팀',
    type: 'textarea',
    rows: 2,
  },
  {
    id: 'additionalInfo',
    label: '추가 정보',
    placeholder: '참고 자료, 특별 요구사항, 강조할 내용 등 자유롭게 입력해 주세요.',
    type: 'textarea',
    rows: 3,
  },
];

export default function DetailsStep({ initialDetails, onNext, onBack }) {
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState({});

  function handleChange(id, value) {
    setDetails((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  }

  function validate() {
    const newErrors = {};
    FIELDS.filter((f) => f.required).forEach((f) => {
      if (!details[f.id]?.trim()) {
        newErrors[f.id] = '필수 항목입니다.';
      }
    });
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onNext(details);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">새 제안서 정보 입력</h2>
            <p className="text-sm text-slate-500">생성할 제안서에 대한 정보를 입력해 주세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {FIELDS.map((field) => (
            <div key={field.id}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={details[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className={`input-field resize-none ${errors[field.id] ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
              ) : (
                <input
                  type="text"
                  value={details[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={`input-field ${errors[field.id] ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
              )}
              {errors[field.id] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onBack} className="btn-secondary">
              이전
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              제안서 생성 시작
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
