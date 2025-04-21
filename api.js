export async function callOpenAI(text) {
  // Get API key from storage
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) {
    throw new Error('Please enter your OpenAI API key in the settings');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a privacy and data protection expert. Analyze the provided terms and conditions or privacy policy and identify up to 5 of the most critical, unique privacy or data protection violations, risks, or user rights issues. Focus on privacy, data collection, data sharing, user consent, and user rights. If there are no high-severity issues, include lower or medium risks so that users are always made aware of potential concerns. Ignore unrelated topics (e.g., age, payment, governing law, general content rules).

For each issue, provide:
  - 'title': a short summary (max 8 words, no generic titles like "Analysis Error" or "No Major Issues Found")
  - 'severity': HIGH, MEDIUM, or LOW (choose the most appropriate, but do not omit lower risks if no high/medium are found)
  - 'description': a concise explanation (max 3 sentences) of why users should care, referencing the relevant section if possible.

Return ONLY up to 5 important, unique, and non-overlapping issues, sorted from highest to lowest severity (HIGH first). If there are fewer than 5, return as many as found. Respond ONLY with a JSON array of objects, no extra text, markdown, or comments.

If you cannot find any privacy or data protection issues, return an empty JSON array: [].
Do NOT include any error messages, explanations, or meta-analysis in your response. Respond ONLY with a valid JSON array of issue objects as specified above.

Example issues:
[
  {"title": "Broad Data Collection", "severity": "HIGH", "description": "The service collects a wide range of personal and usage data. Users should be aware of the scope of data collected and potential privacy implications."},
  {"title": "Unclear Data Sharing", "severity": "MEDIUM", "description": "The terms do not specify with whom user data is shared or for what purposes. This lack of clarity could lead to unauthorized data use."},
  {"title": "Difficult Opt-Out Process", "severity": "LOW", "description": "Opting out of certain data uses or analytics is possible but not straightforward, which may result in unintentional data processing."}
]
`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}
