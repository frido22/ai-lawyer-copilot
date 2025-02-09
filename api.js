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
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a privacy-focused legal expert. Analyze the provided terms and conditions or privacy policy, and identify the 3 most concerning privacy violations or user rights issues. Focus on serious issues that could impact user privacy, data security, or legal rights. Your response should be a JSON array with each item having: 'severity' (HIGH/MEDIUM/LOW), 'title' (short and clear), and 'description' (2-3 simple sentences explaining why users should care)."
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
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}
