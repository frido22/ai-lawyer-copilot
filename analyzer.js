export function parseAnalysisResult(data) {
  try {
    // Extract the content and clean up any JSON formatting issues
    let content = data.choices[0].message.content;
    // Remove any "```json" or "```" markers
    content = content.replace(/```json\s?|\s?```/g, '');
    const violations = JSON.parse(content);

    // Sort violations by severity
    const severityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
    violations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return violations;
  } catch (e) {
    console.error('Error parsing GPT response:', e);
    return [{
      severity: 'HIGH',
      title: 'Analysis Error',
      description: 'There was an error processing the analysis results. This might be due to the complexity of the document or an unexpected response format.'
    }];
  }
}
