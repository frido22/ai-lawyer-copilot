document.addEventListener('DOMContentLoaded', function() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');
  const violationsDiv = document.getElementById('violations');

  analyzeBtn.addEventListener('click', async () => {
    // Show loading state
    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    analyzeBtn.disabled = true;

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to get the page content
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTerms' });
      
      if (response.text) {
        // Analyze the text using background script (which handles API calls)
        const analysis = await chrome.runtime.sendMessage({
          action: 'analyzeTerms',
          text: response.text
        });

        // Display results
        displayResults(analysis.violations);
      }
    } catch (error) {
      console.error('Error:', error);
      violationsDiv.innerHTML = '<div class="violation"><h3>Error</h3><p>Could not analyze the page. Make sure you\'re on a page with terms and conditions.</p></div>';
    }

    // Hide loading state
    loadingDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    analyzeBtn.disabled = false;
  });

  function displayResults(violations) {
    violationsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
    
    if (violations && violations.length > 0) {
      violations.forEach(violation => {
        const violationElement = document.createElement('div');
        violationElement.className = 'violation';
        violationElement.setAttribute('data-severity', violation.severity);
        
        violationElement.innerHTML = `
          <h3>
            ${violation.title}
            <span class="severity">${violation.severity}</span>
          </h3>
          <p>${violation.description}</p>
        `;
        violationsDiv.appendChild(violationElement);
      });
    } else {
      violationsDiv.innerHTML = `
        <div class="violation" data-severity="LOW">
          <h3>✅ No Major Issues Found</h3>
          <p>No significant privacy concerns were detected in this document. However, it's always good practice to read through terms and conditions carefully.</p>
        </div>`;
    }
  }
});
