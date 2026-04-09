export const TEXT_MODEL = 'gemini-3.1-flash-lite-preview';
export const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(apiKey, model, body) {
  const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMsg = `API 오류 (HTTP ${response.status})`;
    try {
      const errData = await response.json();
      errorMsg = errData.error?.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function validateApiKey(apiKey) {
  const data = await callGemini(apiKey, TEXT_MODEL, {
    contents: [{ parts: [{ text: '안녕하세요' }] }],
    generationConfig: { maxOutputTokens: 5 },
  });
  return Array.isArray(data.candidates) && data.candidates.length > 0;
}

export async function analyzeProposalStructure(apiKey, referenceContent) {
  const parts = [];

  if (typeof referenceContent === 'string') {
    parts.push({ text: referenceContent });
  } else {
    parts.push({ inline_data: { mime_type: referenceContent.mimeType, data: referenceContent.data } });
  }

  parts.push({
    text: `이 제안서를 분석하여 다음 정보를 JSON 형식으로만 반환해주세요 (마크다운 코드 블록 없이 순수 JSON만):
{
  "sections": ["섹션명1", "섹션명2"],
  "tone": "formal 또는 casual",
  "language": "ko 또는 en",
  "colorTheme": {
    "primary": "#16진수색상",
    "secondary": "#16진수색상"
  },
  "keyElements": ["핵심요소1", "핵심요소2"],
  "designStyle": "디자인 스타일 간단한 설명",
  "structureSummary": "전체 구조에 대한 2-3문장 요약"
}`,
  });

  const data = await callGemini(apiKey, TEXT_MODEL, {
    contents: [{ parts }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
  });

  const raw = data.candidates[0].content.parts[0].text;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('제안서 구조 분석에 실패했습니다. 다시 시도해 주세요.');
  return JSON.parse(jsonMatch[0]);
}

export async function generateProposalHtml(apiKey, analysis, details) {
  const systemInstruction = `당신은 전문 제안서 작성 전문가입니다. 참고 양식의 구조와 스타일을 충실히 반영하여 완성도 높은 제안서 HTML을 생성합니다. 항상 완전하고 독립적인 HTML 문서만 반환합니다.`;

  const primaryColor = analysis.colorTheme?.primary || '#2563eb';
  const secondaryColor = analysis.colorTheme?.secondary || '#1e40af';

  const prompt = `참고 제안서 분석 결과를 바탕으로 새로운 제안서를 완성된 HTML 문서로 생성해주세요.

## 참고 제안서 구조 분석:
- 섹션 구성: ${(analysis.sections || []).join(', ')}
- 문체: ${analysis.tone || 'formal'}
- 핵심 요소: ${(analysis.keyElements || []).join(', ')}
- 디자인 스타일: ${analysis.designStyle || '전문적'}
- 구조 요약: ${analysis.structureSummary || ''}

## 새 제안서 정보:
- 프로젝트명: ${details.projectName}
- 클라이언트 / 회사명: ${details.clientName}
- 프로젝트 설명: ${details.projectDescription}
- 목표 및 목적: ${details.objectives || '미기재'}
- 예산: ${details.budget || '미기재'}
- 일정: ${details.timeline || '미기재'}
- 팀 / 담당자 정보: ${details.teamInfo || '미기재'}
- 추가 정보: ${details.additionalInfo || '없음'}

## 생성 지침:
1. 참고 제안서의 섹션 구조를 그대로 따르세요.
2. 완전히 독립적인 HTML 문서(<!DOCTYPE html>부터 </html>)로 작성하세요.
3. 모든 CSS는 <style> 태그 안에 포함하세요 (외부 파일 참조 금지).
4. 기본 색상: ${primaryColor}, 보조 색상: ${secondaryColor}
5. 반응형 레이아웃으로 작성하세요.
6. 이미지가 시각적으로 필요한 곳(예: 프로젝트 개요, 주요 기능 소개, 일정 다이어그램 등)에 아래 형식으로 이미지 플레이스홀더를 최대 3개 포함하세요:
   <img data-generate="true" data-prompt="[이미지를 설명하는 구체적인 영어 프롬프트, 예: professional infographic showing project timeline with milestones]" alt="[이미지 대체 텍스트]" style="width:100%;max-width:720px;border-radius:12px;margin:20px 0;display:block;" />
7. 전문적이고 시각적으로 매력적인 디자인으로 작성하세요.
8. 인쇄 시 잘 보이도록 @media print 스타일도 포함하세요.

HTML 문서 전체를 반환하세요. 마크다운, 코드 블록, 설명 없이 HTML 코드만 반환하세요.`;

  const data = await callGemini(apiKey, TEXT_MODEL, {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  let html = data.candidates[0].content.parts[0].text.trim();
  // Strip markdown code fences if model wraps in them
  if (html.startsWith('```')) {
    html = html.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  return html;
}

export async function generateImage(apiKey, prompt) {
  try {
    const data = await callGemini(apiKey, IMAGE_MODEL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['image'],
      },
    });

    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);
    if (imagePart) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
  } catch (e) {
    console.warn('이미지 생성 실패:', e.message);
  }
  return null;
}

export async function processProposalImages(apiKey, html, onProgress) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imageEls = Array.from(doc.querySelectorAll('img[data-generate="true"]'));

  for (let i = 0; i < imageEls.length; i++) {
    const img = imageEls[i];
    const prompt = img.getAttribute('data-prompt') || 'professional business illustration';
    onProgress?.(`이미지 생성 중 (${i + 1}/${imageEls.length})...`);
    const dataUrl = await generateImage(apiKey, prompt);
    if (dataUrl) {
      img.src = dataUrl;
    } else {
      // Replace with a styled placeholder div
      const placeholder = doc.createElement('div');
      placeholder.style.cssText =
        'width:100%;max-width:720px;height:300px;background:#f1f5f9;border-radius:12px;margin:20px 0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:14px;';
      placeholder.textContent = img.alt || '이미지';
      img.replaceWith(placeholder);
    }
    img.removeAttribute('data-generate');
    img.removeAttribute('data-prompt');
  }

  const serializer = new XMLSerializer();
  return '<!DOCTYPE html>' + serializer.serializeToString(doc.documentElement);
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

export function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsText(file, 'utf-8');
  });
}
