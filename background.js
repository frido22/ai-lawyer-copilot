import { callOpenAI } from './api.js';
import { parseAnalysisResult } from './analyzer.js';

// Helper: Split text into logical or fixed-size chunks, with a hard chunk limit
function chunkText(text, maxLen = 3500, maxChunks = 5) {
  // Try splitting by headings if present
  const headingRegex = /(?:^|\n)(#+|\bSection\b|\bArticle\b|\bChapter\b)[^\n]*\n/gi;
  let sections = text.split(headingRegex).filter(Boolean);
  if (sections.length > 1) {
    // Merge heading with following section
    let merged = [];
    for (let i = 0; i < sections.length; i += 2) {
      let heading = sections[i].trim();
      let body = (sections[i+1] || '').trim();
      merged.push((heading + '\n' + body).trim());
    }
    sections = merged;
  } else {
    // Fallback: fixed-size chunks
    sections = [];
    for (let i = 0; i < text.length; i += maxLen) {
      sections.push(text.slice(i, i + maxLen));
    }
  }
  // Enforce a hard chunk limit for very large documents
  if (sections.length > maxChunks) {
    // Merge any overflow into the last chunk
    const limited = sections.slice(0, maxChunks - 1);
    const remainder = sections.slice(maxChunks - 1).join('\n\n');
    limited.push(remainder);
    return limited;
  }
  return sections;
}

// Analyze all chunks and merge results
async function analyzeText(text) {
  try {
    const chunks = chunkText(text);
    let allViolations = [];
    for (let i = 0; i < chunks.length; i++) {
      const data = await callOpenAI(chunks[i]);
      const violations = parseAnalysisResult(data);
      allViolations = allViolations.concat(violations);
    }
    // Deduplicate by title+description
    const seen = new Set();
    const deduped = allViolations.filter(v => {
      const key = v.title + v.description;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Enforce a hard output limit of 5, sorted by severity
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    deduped.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));
    return deduped.slice(0, 5);
  } catch (error) {
    throw new Error('Failed to analyze the document. Please try again.');
  }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeTerms') {
    analyzeText(request.text)
      .then(violations => sendResponse({ violations }))
      .catch(error => {
        sendResponse({ error: error.message });
      });
    // Required for async response
    return true;
  }
});
