import React, { useState } from 'react';

export default function DetailsStep({ initialDetails, onNext, onBack }) {
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState({});

  function handleChange(id, value) {
    setDetails((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!details.projectName?.trim()) newErrors.projectName = '필수 항목입니다.';
    if (!details.clientName?.trim()) newErrors.clientName = '필수 항목입니다.';
    if (!details.projectDescription?.trim()) newErrors.projectDescription = '필수 항목입니다.';
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-violet-500 to-blue-500" />

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">새 제안서 정보 입력</h2>
              <p className="text-sm text-slate-500 mt-0.5">생성할 제안서에 대한 정보를 입력해 주세요</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Section 1: 기본 정보 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">기본 정보</p>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    프로젝트명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={details.projectName || ''}
                    onChange={(e) => handleChange('projectName', e.target.value)}
                    placeholder="예: ABC 쇼핑몰 리뉴얼 프로젝트"
                    className={`input-field ${errors.projectName ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                  {errors.projectName && <p className="text-xs text-red-500 mt-1">{errors.projectName}</p>}
                </div>
                <div>
                  <label className="label">
                    클라이언트 / 의뢰 회사명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={details.clientName || ''}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    placeholder="예: (주)테크스타트"
                    className={`input-field ${errors.clientName ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                  {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* Section 2: 프로젝트 내용 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">프로젝트 내용</p>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    프로젝트 설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={details.projectDescription || ''}
                    onChange={(e) => handleChange('projectDescription', e.target.value)}
                    placeholder="프로젝트의 배경, 범위, 주요 내용을 자세히 작성해 주세요."
                    rows={4}
                    className={`input-field resize-none ${errors.projectDescription ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                  {errors.projectDescription && <p className="text-xs text-red-500 mt-1">{errors.projectDescription}</p>}
                </div>
                <div>
                  <label className="label">목표 및 기대효과</label>
                  <textarea
                    value={details.objectives || ''}
                    onChange={(e) => handleChange('objectives', e.target.value)}
                    placeholder="예: 모바일 전환율 30% 향상, 구매 프로세스 간소화, 브랜드 이미지 개선"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* Section 3: 예산 및 일정 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">예산 및 일정</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">예산</label>
                  <input
                    type="text"
                    value={details.budget || ''}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    placeholder="예: 3,000만원 ~ 5,000만원"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">프로젝트 일정</label>
                  <input
                    type="text"
                    value={details.timeline || ''}
                    onChange={(e) => handleChange('timeline', e.target.value)}
                    placeholder="예: 2025년 3월 ~ 8월 (6개월)"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* Section 4: 팀 및 추가 정보 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">팀 및 추가 정보</p>
              <div className="space-y-4">
                <div>
                  <label className="label">팀 구성 / 담당자 정보</label>
                  <textarea
                    value={details.teamInfo || ''}
                    onChange={(e) => handleChange('teamInfo', e.target.value)}
                    placeholder="예: PM 1명, 디자이너 2명, 개발자 3명으로 구성된 전담팀"
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="label">추가 정보</label>
                  <textarea
                    value={details.additionalInfo || ''}
                    onChange={(e) => handleChange('additionalInfo', e.target.value)}
                    placeholder="참고 자료, 특별 요구사항, 강조할 내용 등 자유롭게 입력해 주세요."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
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
    </div>
  );
}
