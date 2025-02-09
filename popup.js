document.addEventListener('DOMContentLoaded', function() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');
  const violationsDiv = document.getElementById('violations');
  const settingsBtn = document.querySelector('.settings-btn');
  const settingsPanel = document.getElementById('settingsPanel');

  // Function to check if settings are configured
  function checkSettings() {
    chrome.storage.sync.get(['OPENAI_API_KEY', 'OPENAI_API_MODEL', 'TOP_K_RESULTS_SEVERITY'], function(items) {
      const tooltipText = document.querySelector('.tooltiptext');
      if (items.OPENAI_API_KEY && items.OPENAI_API_MODEL && items.TOP_K_RESULTS_SEVERITY) {
        analyzeBtn.disabled = false;
        if (tooltipText) {
          tooltipText.style.display = 'none';
        }
      } else {
        analyzeBtn.disabled = true;
        if (tooltipText) {
          tooltipText.style.display = 'block';
        }
      }
    });
    }

  // Check settings on load
  checkSettings();

  // Load saved settings
  chrome.storage.sync.get(['OPENAI_API_KEY', 'OPENAI_API_MODEL', 'TOP_K_RESULTS_SEVERITY'], function(items) {
    if (items.OPENAI_API_KEY) document.getElementById('apiKey').value = items.OPENAI_API_KEY;
    if (items.OPENAI_API_MODEL) document.getElementById('model').value = items.OPENAI_API_MODEL;
    if (items.TOP_K_RESULTS_SEVERITY) document.getElementById('top_k_results_severity').value = items.TOP_K_RESULTS_SEVERITY;
  });

  // Settings button click handler
  settingsBtn.addEventListener('click', function() {
    settingsPanel.classList.toggle('show');
  });

  // Close settings panel when clicking outside
  document.addEventListener('click', function(event) {
    if (!settingsPanel.contains(event.target) && !settingsBtn.contains(event.target)) {
      settingsPanel.classList.remove('show');
    }
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('model').value;
    const topKResults = document.getElementById('top_k_results_severity').value;
  
    chrome.storage.sync.set({
      OPENAI_API_KEY: apiKey,
      OPENAI_API_MODEL: model,
      TOP_K_RESULTS_SEVERITY: topKResults
    }, function() {
      settingsPanel.classList.remove('show');
      alert('Settings saved successfully!');
      checkSettings(); // Check settings after saving
    });
  });
  
  // Analyze button click handler
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
      
      if (response && response.text) {
        // Get settings from storage
        const settings = await chrome.storage.sync.get(['OPENAI_API_KEY', 'OPENAI_API_MODEL', 'TOP_K_RESULTS_SEVERITY']);
        console.log('Settings:', settings);
        // Analyze the text using background script (which handles API calls)
        const analysis = await chrome.runtime.sendMessage({
          action: 'analyzeTerms',
          text: response.text,
          settings: settings
        });

        if (analysis && analysis.violations) {
          // Display results
          displayResults(analysis.violations);
        } else {
          throw new Error('No analysis results received');
        }
      } else {
        throw new Error('No text content received from page');
      }
    } catch (error) {
      console.error('Error:', error);
      violationsDiv.innerHTML = '<div class="violation"><h3>Error</h3><p>Could not analyze the page. Make sure you\'re on a page with terms and conditions.</p></div>';
    } finally {
      // Hide loading state
      loadingDiv.style.display = 'none';
      resultsDiv.style.display = 'block';
      analyzeBtn.disabled = false;
    }
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