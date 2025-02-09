// Import configuration
import config from './config.js';

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeTerms') {
    analyzeText(request.text, request.settings)
      .then(violations => sendResponse({ violations }))
      .catch(error => {
        console.error('Error analyzing text:', error);
        sendResponse({ error: error.message });
      });
    // Required for async response
    return true;
  }
});

async function analyzeText(text, settings) {
  try {
    console.log('Making API call with settings:', settings);
    if (!settings.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Please add it in the settings.');
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: settings.OPENAI_API_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a privacy-focused legal expert. Analyze the provided terms and conditions or privacy policy, and identify the ${settings.TOP_K_SEVERITY} most concerning privacy violations or user rights issues. Focus on serious issues that could impact user privacy, data security, or legal rights. Format each issue with an attention-grabbing emoji and clear, simple language that explains why it matters. Your response should be a JSON array with each item having: 'severity' (HIGH/MEDIUM/LOW), 'emoji', 'title' (short and clear), 'explanation' (2-3 simple sentences explaining why users should care), and 'illustrative example' (a small illustrative example story, of maximum 150 words, real or ficticious, that illustrates the potential exploitation issues that each 'sevirity' may pose).`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 15000 // The average length of a privacy policy is around 7,000 words
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message ||'Failed to analyze text');
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
