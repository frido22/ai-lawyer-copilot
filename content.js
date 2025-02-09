// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTerms') {
    try {
      // Get all text content from the main content area
      const mainContent = document.body.innerText;
      
      // If the page is too short, it might not be the full terms
      if (mainContent.length < 100) {
        // Try to find specific content containers that might hold the terms
        const possibleContainers = [
          ...document.querySelectorAll('main, article, .content, .terms, .policy, [role="main"]'),
          ...document.querySelectorAll('div[class*="content"], div[class*="terms"], div[class*="policy"]')
        ];

        for (const container of possibleContainers) {
          if (container.innerText.length > mainContent.length) {
            sendResponse({ text: container.innerText });
            return true;
          }
        }
      }

      // Send the extracted text back to the popup
      sendResponse({ text: mainContent });
    } catch (error) {
      console.error('Error extracting text:', error);
      sendResponse({ error: 'Failed to extract text from the page' });
    }
    return true;
  }
});
