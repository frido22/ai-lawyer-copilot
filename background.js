// Import configuration
import config from './config.js';

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeTerms') {
    analyzeText(request.text)
      .then(violations => sendResponse({ violations }))
      .catch(error => sendResponse({ error: error.message }));
    
    // Required for async response
    return true;
  }
});

async function analyzeText(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a privacy-focused legal expert. Analyze the provided terms and conditions or privacy policy, and identify the 3 most concerning privacy violations or user rights issues. Focus on serious issues that could impact user privacy, data security, or legal rights. Format each issue with an attention-grabbing emoji and clear, simple language that explains why it matters. Your response should be a JSON array with each item having: 'severity' (HIGH/MEDIUM/LOW), 'emoji', 'title' (short and clear), and 'explanation' (2-3 simple sentences explaining why users should care)."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }

    const data = await response.json();
    let violations = [];

    try {
      // Extract the content and clean up any JSON formatting issues
      let content = data.choices[0].message.content;
      // Remove any "```json" or "```" markers
      content = content.replace(/```json\s?|\s?```/g, '');
      violations = JSON.parse(content);

      // Sort violations by severity
      const severityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      violations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      // Return the violations in the format expected by popup.js
      return violations.map(v => ({
        title: `${v.emoji} ${v.title}`,
        description: v.explanation,
        severity: v.severity
      }));
    } catch (e) {
      console.error('Error parsing GPT response:', e);
      throw new Error('Failed to parse analysis results');
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
}
