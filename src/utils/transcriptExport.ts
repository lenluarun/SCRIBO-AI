import { jsPDF } from 'jspdf';
import { LectureSession, QuickNote } from '../types';

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Formats a word for markdown rendering, bolding key terms and highlighting misspeaks.
 */
function formatWordForMarkdown(
  word: { text: string; isKeyTerm?: boolean; isFlaggedMisspeak?: boolean },
  highlightKeyTerms: boolean,
  markMisspeaks: boolean
): string {
  let text = word.text;
  if (!text) return '';

  // Extract surrounding punctuation so bold asterisks wrap cleanly around the word root
  const match = text.match(/^([^\w]*)(.*?)([.,!?;:]*)$/);
  if (!match) return text;

  const prefix = match[1] || '';
  const core = match[2] || '';
  const suffix = match[3] || '';

  if (!core) return text;

  if (markMisspeaks && word.isFlaggedMisspeak) {
    return `${prefix}⚠️**${core}**${suffix}`;
  }

  if (highlightKeyTerms && word.isKeyTerm) {
    return `${prefix}**${core}**${suffix}`;
  }

  return text;
}

/**
 * Extracts unique highlighted keywords and technical terms from the lecture.
 */
export function extractHighlightedKeywords(lecture: LectureSession): {
  term: string;
  timestamps: string[];
  count: number;
}[] {
  const termMap = new Map<string, { term: string; timestamps: string[] }>();

  if (lecture.words && lecture.words.length > 0) {
    let i = 0;
    while (i < lecture.words.length) {
      if (lecture.words[i].isKeyTerm) {
        // Collect consecutive key term tokens if they form a combined concept
        const phraseTokens: string[] = [];
        const startTimestamp = formatTime(lecture.words[i].startMs);

        while (i < lecture.words.length && lecture.words[i].isKeyTerm) {
          const raw = lecture.words[i].text.replace(/^[^\w]+|[^\w]+$/g, '');
          if (raw) phraseTokens.push(raw);
          i++;
        }

        const fullPhrase = phraseTokens.join(' ').trim();
        if (fullPhrase) {
          const key = fullPhrase.toLowerCase();
          if (!termMap.has(key)) {
            // Capitalize appropriately
            const displayTerm = fullPhrase.charAt(0).toUpperCase() + fullPhrase.slice(1);
            termMap.set(key, { term: displayTerm, timestamps: [startTimestamp] });
          } else {
            termMap.get(key)!.timestamps.push(startTimestamp);
          }
        }
      } else {
        i++;
      }
    }
  }

  // Also include section key terms if provided
  if (lecture.sections) {
    for (const sec of lecture.sections) {
      if (sec.keyTerms) {
        for (const kt of sec.keyTerms) {
          const key = kt.toLowerCase().trim();
          if (key && !termMap.has(key)) {
            termMap.set(key, { term: kt, timestamps: [sec.timeRangeFormatted || 'Section Term'] });
          }
        }
      }
    }
  }

  return Array.from(termMap.values()).map((item) => ({
    term: item.term,
    timestamps: Array.from(new Set(item.timestamps)),
    count: item.timestamps.length,
  }));
}

/**
 * Groups timed words into readable paragraphs based on sentence-ending punctuation
 * or reasonable time gaps (> 2500ms).
 */
export function groupTranscriptWords(
  words: LectureSession['words'],
  options: { highlightKeyTerms?: boolean; markMisspeaks?: boolean } = { highlightKeyTerms: true, markMisspeaks: true }
): { timeFormatted: string; startMs: number; text: string }[] {
  if (!words || words.length === 0) return [];

  const chunks: { timeFormatted: string; startMs: number; text: string }[] = [];
  let currentChunk: string[] = [];
  let chunkStartMs = words[0].startMs;

  words.forEach((word, idx) => {
    const formatted = formatWordForMarkdown(
      word,
      options.highlightKeyTerms ?? true,
      options.markMisspeaks ?? true
    );
    currentChunk.push(formatted);

    const isSentenceEnd = /[.?!]$/.test(word.text.trim());
    const nextWord = words[idx + 1];
    const isBigGap = nextWord && nextWord.startMs - word.endMs > 2500;
    const isTooLong = currentChunk.length >= 35;

    if (isSentenceEnd || isBigGap || isTooLong || idx === words.length - 1) {
      chunks.push({
        timeFormatted: formatTime(chunkStartMs),
        startMs: chunkStartMs,
        text: currentChunk.join(' '),
      });
      currentChunk = [];
      if (nextWord) {
        chunkStartMs = nextWord.startMs;
      }
    }
  });

  return chunks;
}

/**
 * Generates formatted Markdown string of the lecture transcript,
 * containing the transcript, highlighted keywords, and any captured misspeak alerts.
 */
export function generateMarkdownTranscript(lecture: LectureSession, quickNotes?: QuickNote[]): string {
  const durationMin = Math.round(lecture.durationMs / 60000);
  const chunks = groupTranscriptWords(lecture.words, { highlightKeyTerms: true, markMisspeaks: true });
  const highlightedKeywords = extractHighlightedKeywords(lecture);

  let md = `# ${lecture.title}\n\n`;
  md += `**Course:** ${lecture.courseCode} — ${lecture.courseName}\n`;
  md += `**Instructor:** ${lecture.instructor}\n`;
  md += `**Date:** ${lecture.date}\n`;
  md += `**Session Duration:** ~${durationMin} min (${lecture.words.length} transcribed speech tokens)\n`;
  md += `**Exported via:** Scribo AI On-Device Academic Co-Pilot\n\n`;
  md += `---\n\n`;

  if (lecture.overview) {
    md += `## 📌 Lecture Overview\n\n`;
    md += `> ${lecture.overview}\n\n`;
  }

  // 1. Highlighted Keywords Section
  md += `## 🔑 Highlighted Keywords & Core Terminology\n\n`;
  if (highlightedKeywords.length > 0) {
    md += `The on-device linguistic engine highlighted **${highlightedKeywords.length}** high-yield academic concepts and technical terms throughout this lecture:\n\n`;
    highlightedKeywords.forEach((kw) => {
      const timestampsStr = kw.timestamps.map((t) => `\`${t}\``).join(', ');
      md += `- **${kw.term}** — Mentioned at ${timestampsStr} (${kw.count} occurrence${kw.count > 1 ? 's' : ''})\n`;
    });
    md += `\n`;
  } else {
    md += `*No specific highlighted keywords were flagged in this session.*\n\n`;
  }

  // 2. Captured Misspeak Alerts Section
  md += `## ⚠️ Captured Misspeak Alerts & Syllabus Verifications\n\n`;
  if (lecture.misspeaks && lecture.misspeaks.length > 0) {
    md += `The dual-layer verification engine cross-referenced spoken speech against the course syllabus and captured **${lecture.misspeaks.length}** factual discrepancies:\n\n`;

    lecture.misspeaks.forEach((m, i) => {
      const severityLabel = m.severity === 'correction' ? 'FACTUAL CORRECTION' : 'CLARIFICATION';
      md += `### ${i + 1}. Alert at [${m.timeFormatted}] — [${severityLabel}]\n`;
      md += `- **Spoken in Class:** *"${m.spokenQuote}"*\n`;
      md += `- **Verified Syllabus Truth:** **${m.correctFact}**\n`;
      md += `- **Official Literature Citation:** \`${m.citation}\`\n`;
      md += `- **Playback Position:** ${m.timeFormatted} (${m.timestampMs} ms)\n`;
      md += `- **Resolution Status:** ${m.resolved ? '✅ Resolved by Student' : '🔍 Logged for Active Review'}\n\n`;
    });
  } else {
    md += `*Zero misspeaks detected. Spoken speech fully aligns with authorized syllabus literature.*\n\n`;
  }

  // 3. Student's Private Quick Notes & Annotations (if present)
  if (quickNotes && quickNotes.length > 0) {
    md += `## 📝 Student's Private Quick Notes & Annotations\n\n`;
    quickNotes.forEach((n) => {
      const cat = n.category ? `[${n.category.toUpperCase()}] ` : '';
      md += `- **[${n.timeFormatted}]** ${cat}${n.text}\n`;
    });
    md += `\n`;
  }

  // 4. Mapped Syllabus Skill Nodes (if present)
  if (lecture.syllabusNodes && lecture.syllabusNodes.length > 0) {
    md += `## 🎯 Mapped Syllabus Skill Nodes\n\n`;
    lecture.syllabusNodes.forEach((node) => {
      md += `- **${node.code} (${node.name}):** ${node.description} [Status: ${node.status.toUpperCase()}, Progress: ${node.progressPercent}%]\n`;
    });
    md += `\n`;
  }

  // 5. Full Word-Synced Transcript
  md += `## 🎙️ Full Word-Synced Transcript\n\n`;
  md += `*(Note: Highlighted keywords appear in **bold**, and captured misspeak segments are flagged with ⚠️)*\n\n`;
  chunks.forEach((chunk) => {
    md += `**[${chunk.timeFormatted}]** ${chunk.text}\n\n`;
  });

  md += `---\n`;
  md += `*Generated for student offline study and revision by Scribo AI.*`;

  return md;
}

/**
 * Downloads a text-based file (Markdown) directly in the browser.
 */
export function downloadMarkdownFile(lecture: LectureSession, quickNotes?: QuickNote[]): void {
  const content = generateMarkdownTranscript(lecture, quickNotes);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const sanitizedTitle = `${lecture.courseCode}_${lecture.title}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  anchor.href = url;
  anchor.download = `Scribo_Notes_${sanitizedTitle}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, styled multi-page PDF document of the transcript.
 */
export function downloadPdfTranscript(lecture: LectureSession, quickNotes?: QuickNote[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  function checkPageBreak(requiredHeight: number) {
    if (cursorY + requiredHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 20;
      addPageHeader();
    }
  }

  function addPageHeader() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(`${lecture.courseCode} • ${lecture.title} | Scribo AI Offline Study Note`, margin, 12);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, 14, pageWidth - margin, 14);
  }

  // First page Header banner
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, cursorY, contentWidth, 36, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 36, 3, 3, 'S');

  // Brand tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text('SCRIBO AI • ON-DEVICE ACADEMIC CO-PILOT', margin + 6, cursorY + 8);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  const titleLines = doc.splitTextToSize(lecture.title, contentWidth - 12);
  doc.text(titleLines, margin + 6, cursorY + 16);

  // Metadata line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  const metaText = `Course: ${lecture.courseCode} | Instructor: ${lecture.instructor} | Date: ${lecture.date} | ${lecture.words.length} Tokens`;
  doc.text(metaText, margin + 6, cursorY + 30);

  cursorY += 44;

  // Overview Section
  if (lecture.overview) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Lecture Overview & Core Concepts', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const overviewLines = doc.splitTextToSize(lecture.overview, contentWidth);
    doc.text(overviewLines, margin, cursorY);
    cursorY += overviewLines.length * 5 + 8;
  }

  // Quick Notes Section
  if (quickNotes && quickNotes.length > 0) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text(`2. Student's Private Quick Notes (${quickNotes.length})`, margin, cursorY);
    cursorY += 6;

    quickNotes.forEach((n) => {
      checkPageBreak(18);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      const tagLabel = n.category ? `[${n.category.toUpperCase()}]` : '';
      doc.text(`[${n.timeFormatted}] ${tagLabel}`, margin + 3, cursorY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const noteLines = doc.splitTextToSize(n.text, contentWidth - 45);
      doc.text(noteLines[0] || '', margin + 35, cursorY + 5.5);
      if (noteLines.length > 1) {
        doc.text(noteLines[1] || '', margin + 35, cursorY + 10);
      }

      cursorY += 17;
    });
    cursorY += 4;
  }

  // Fact-Check / Misspeak Alerts Section
  if (lecture.misspeaks && lecture.misspeaks.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text(`${quickNotes && quickNotes.length > 0 ? '3' : '2'}. Dual-Layer Fact Checks & Misspeak Corrections`, margin, cursorY);
    cursorY += 6;

    lecture.misspeaks.forEach((m) => {
      checkPageBreak(32);

      // Card background
      doc.setFillColor(254, 243, 199); // Amber 100
      doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(146, 64, 14);
      doc.text(`[${m.timeFormatted}] Spoken: "${m.spokenQuote}"`, margin + 4, cursorY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(22, 101, 52); // Emerald 800
      doc.text(`Truth: ${m.correctFact}`, margin + 4, cursorY + 12);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Citation: ${m.citation}`, margin + 4, cursorY + 18);

      cursorY += 28;
    });
    cursorY += 4;
  }

  // Full Transcript Section
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  const transcriptSecNum = (quickNotes && quickNotes.length > 0 ? 3 : 2) + (lecture.misspeaks && lecture.misspeaks.length > 0 ? 1 : 0);
  doc.text(`${transcriptSecNum}. Full Word-Synced Speech Transcript`, margin, cursorY);
  cursorY += 7;

  const chunks = groupTranscriptWords(lecture.words);

  chunks.forEach((chunk) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229); // Indigo 600
    const timeTag = `[${chunk.timeFormatted}]`;
    const timeWidth = doc.getTextWidth(timeTag) + 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const bodyLines = doc.splitTextToSize(chunk.text, contentWidth - timeWidth);

    const blockHeight = Math.max(bodyLines.length * 4.6, 6) + 3;
    checkPageBreak(blockHeight);

    // Draw timestamp tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(timeTag, margin, cursorY);

    // Draw paragraph text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(bodyLines, margin + timeWidth, cursorY);

    cursorY += blockHeight;
  });

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages} • Scribo AI Offline Study Document`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const sanitizedTitle = lecture.courseCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Scribo_${sanitizedTitle}_Transcript_${lecture.date}.pdf`);
}
