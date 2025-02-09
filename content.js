// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTerms') {
    // Get all text content from the page
    let text = document.body.innerText;
    // console.log('Found text:', text);

    // Try to find specific terms and conditions sections
    const possibleSelectors = [
      'terms-and-conditions',
      'terms-of-service',
      'privacy-policy',
      'legal-terms',
      'tos',
      'terms'
    ];

    for (const selector of possibleSelectors) {
      const element = document.getElementById(selector) || 
                     document.querySelector(`[class*="${selector}"]`);
      if (element) {
        text = element.innerText;
        break;
      }
    }

    // Send the text back to the popup
    sendResponse({ text });
  }
  
  // Required for async response
  return true;
});
