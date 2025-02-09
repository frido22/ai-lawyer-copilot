import { callOpenAI } from './api.js';
import { parseAnalysisResult } from './analyzer.js';

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeTerms') {
    analyzeText(request.text)
      .then(violations => sendResponse({ violations }))
      .catch(error => {
        console.error('Analysis error:', error);
        sendResponse({ error: error.message });
      });
    
    // Required for async response
    return true;
  }
});

async function analyzeText(text) {
  try {
    console.log('Starting analysis...');
    const data = await callOpenAI(text);
    console.log('API Response:', data);
    return parseAnalysisResult(data);
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw new Error('Failed to analyze the document. Please try again.');
  }
}
