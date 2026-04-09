import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  Packer,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from 'docx';

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getMimeAndBase64(src) {
  const match = src.match(/^data:(image\/(\w+));base64,(.+)$/s);
  if (!match) return null;
  return { mimeType: match[1], ext: match[2] === 'jpeg' ? 'jpg' : match[2], base64: match[3] };
}

/** Recursively extract inline TextRun children from an element */
function getInlineRuns(node, inherited = {}) {
  const runs = [];
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent;
      if (text) {
        runs.push(new TextRun({ text, ...inherited }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName.toLowerCase();
      const next = { ...inherited };
      if (tag === 'strong' || tag === 'b') next.bold = true;
      if (tag === 'em' || tag === 'i') next.italics = true;
      if (tag === 'u') next.underline = { type: 'single' };
      if (tag === 's' || tag === 'del') next.strike = true;
      if (tag === 'br') {
        runs.push(new TextRun({ text: '', break: 1 }));
        continue;
      }
      runs.push(...getInlineRuns(child, next));
    }
  }
  return runs;
}

/** Handle <img> tag → ImageRun paragraph */
async function handleImage(el) {
  const src = el.getAttribute('src') || '';
  if (!src.startsWith('data:')) return [];

  const parsed = getMimeAndBase64(src);
  if (!parsed) return [];

  try {
    const data = base64ToUint8Array(parsed.base64);
    // Get natural dimensions via Image element
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 600, h: 300 });
      img.src = src;
    });

    const maxW = 600;
    const scale = dims.w > maxW ? maxW / dims.w : 1;
    const width = Math.round(dims.w * scale);
    const height = Math.round(dims.h * scale);

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data,
            transformation: { width, height },
            type: parsed.ext,
          }),
        ],
        spacing: { before: 120, after: 120 },
      }),
    ];
  } catch {
    return [];
  }
}

/** Handle <table> */
async function handleTable(el) {
  const rows = [];
  const trEls = el.querySelectorAll('tr');

  for (const tr of trEls) {
    const cells = [];
    for (const td of tr.querySelectorAll('td, th')) {
      const isHeader = td.tagName.toLowerCase() === 'th';
      const text = td.textContent.trim();
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: isHeader })],
            }),
          ],
          shading: isHeader
            ? { fill: '2563EB', type: ShadingType.SOLID }
            : undefined,
          width: { size: 100 / tr.children.length, type: WidthType.PERCENTAGE },
        })
      );
    }
    if (cells.length > 0) rows.push(new TableRow({ children: cells }));
  }

  if (rows.length === 0) return [];
  return [
    new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
    new Paragraph({ text: '' }),
  ];
}

/** Determine if node is effectively hidden */
function isHidden(el) {
  const style = el.getAttribute('style') || '';
  return style.includes('display:none') || style.includes('display: none');
}

/** Main recursive processor — returns array of docx block elements */
async function processElement(el) {
  if (el.nodeType !== Node.ELEMENT_NODE) return [];
  if (isHidden(el)) return [];

  const tag = el.tagName.toLowerCase();

  // Skip style/script/head
  if (['style', 'script', 'head', 'meta', 'link'].includes(tag)) return [];

  // Headings
  const headingMatch = tag.match(/^h([1-6])$/);
  if (headingMatch) {
    const level = parseInt(headingMatch[1], 10) - 1;
    const text = el.textContent.trim();
    if (!text) return [];
    return [
      new Paragraph({
        text,
        heading: HEADING_LEVELS[level],
        spacing: { before: 200, after: 80 },
      }),
    ];
  }

  // Paragraph
  if (tag === 'p') {
    const runs = getInlineRuns(el);
    const text = el.textContent.trim();
    if (!text) return [];
    return [
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text })],
        spacing: { before: 60, after: 60 },
      }),
    ];
  }

  // Image
  if (tag === 'img') return handleImage(el);

  // Horizontal rule
  if (tag === 'hr') {
    return [
      new Paragraph({
        border: {
          bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 4 },
        },
        text: '',
        spacing: { before: 120, after: 120 },
      }),
    ];
  }

  // Unordered list
  if (tag === 'ul') {
    const items = [];
    for (const li of el.querySelectorAll(':scope > li')) {
      const text = li.textContent.trim();
      if (text) {
        items.push(new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 40 } }));
      }
    }
    return items;
  }

  // Ordered list
  if (tag === 'ol') {
    const items = [];
    let idx = 1;
    for (const li of el.querySelectorAll(':scope > li')) {
      const text = li.textContent.trim();
      if (text) {
        items.push(
          new Paragraph({ text: `${idx}. ${text}`, spacing: { after: 40 } })
        );
        idx++;
      }
    }
    return items;
  }

  // Table
  if (tag === 'table') return handleTable(el);

  // Block-level containers — recurse
  const containers = [
    'div', 'section', 'article', 'main', 'header', 'footer',
    'aside', 'figure', 'figcaption', 'body', 'html', 'form',
    'nav', 'details', 'summary', 'blockquote', 'pre',
  ];
  if (containers.includes(tag)) {
    const children = [];
    for (const child of el.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        children.push(...(await processElement(child)));
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) children.push(new Paragraph({ text }));
      }
    }
    return children;
  }

  // Inline/span — wrap in paragraph
  const text = el.textContent.trim();
  if (text) {
    return [new Paragraph({ children: getInlineRuns(el), spacing: { before: 40, after: 40 } })];
  }
  return [];
}

/**
 * Convert an HTML string to a .docx Blob.
 * @param {string} html - Full HTML document string
 * @param {string} [title] - Optional document title
 * @returns {Promise<Blob>}
 */
export async function htmlToDocxBlob(html, title = '제안서') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const body = doc.body;
  const children = [];

  for (const child of body.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(...(await processElement(child)));
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) children.push(new Paragraph({ text }));
    }
  }

  // Ensure at least one paragraph
  if (children.length === 0) {
    children.push(new Paragraph({ text: '' }));
  }

  const document = new Document({
    creator: '제안서 생성기',
    title,
    description: 'AI로 생성된 제안서',
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
