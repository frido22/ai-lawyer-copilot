document.addEventListener('DOMContentLoaded', function() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');
  const violationsDiv = document.getElementById('violations');
  const errorDiv = document.getElementById('error');
  const retryBtn = document.getElementById('retryBtn');
  const newAnalysisBtn = document.getElementById('newAnalysisBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const apiKeyStatus = document.getElementById('apiKeyStatus');
  const apiSection = document.getElementById('apiSection');
  const editKeyBtn = apiSection.querySelector('.edit-btn');
  const apiKeyStatusText = apiSection.querySelector('.api-key-status');

  // Load saved API key
  chrome.storage.sync.get('apiKey', function(data) {
    if (data.apiKey) {
      apiKeyInput.value = '••••••••••••••••';
      analyzeBtn.disabled = false;
      apiSection.classList.add('compact');
      editKeyBtn.style.display = 'block';
      apiKeyStatusText.textContent = 'API Key Saved';
    }
  });

  // Edit API key button
  editKeyBtn.addEventListener('click', () => {
    apiSection.classList.remove('compact');
    editKeyBtn.style.display = 'none';
    apiKeyStatusText.textContent = '';
    apiKeyInput.value = '';
    apiKeyInput.focus();
  });

  // Save API key
  saveApiKeyBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format. It should start with "sk-"', 'error');
      return;
    }

    try {
      // Test the API key
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        await chrome.storage.sync.set({ apiKey });
        showStatus('API key saved successfully!', 'success');
        apiKeyInput.value = '••••••••••••••••';
        analyzeBtn.disabled = false;
        
        // Switch to compact mode after showing success message
        setTimeout(() => {
          apiSection.classList.add('compact');
          editKeyBtn.style.display = 'block';
          apiKeyStatusText.textContent = 'API Key Saved';
        }, 1500);
      } else {
        showStatus('Invalid API key. Please check and try again.', 'error');
      }
    } catch (error) {
      showStatus('Error validating API key. Please try again.', 'error');
    }
  });

  function showStatus(message, type) {
    apiKeyStatus.textContent = message;
    apiKeyStatus.className = 'status-message ' + type;
    setTimeout(() => {
      apiKeyStatus.textContent = '';
      apiKeyStatus.className = 'status-message';
    }, 1500);
  }

  // Function to analyze the current page
  async function analyzeCurrentPage() {
    try {
      // Reset UI state
      loadingDiv.style.display = 'block';
      resultsDiv.style.display = 'none';
      errorDiv.style.display = 'none';
      analyzeBtn.disabled = true;

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Inject content script if needed
      if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Create a timeout promise
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis timed out. Please try again.')), 30000)
        );

        // Get page content
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTerms' });
        
        if (response && response.text) {
          // Race between the analysis and timeout
          const analysis = await Promise.race([
            chrome.runtime.sendMessage({
              action: 'analyzeTerms',
              text: response.text
            }),
            timeout
          ]);

          if (analysis.violations) {
            displayResults(analysis.violations);
          } else {
            throw new Error('No analysis results received');
          }
        } else {
          throw new Error('No text content found to analyze');
        }
      } else {
        throw new Error('Cannot analyze Chrome/Edge system pages');
      }
    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'An error occurred while analyzing the document');
    } finally {
      loadingDiv.style.display = 'none';
      analyzeBtn.disabled = false;
    }
  }

  function showError(message) {
    errorDiv.querySelector('.error-message').textContent = message;
    errorDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
  }

  function displayResults(violations) {
    violationsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    
    if (violations && violations.length > 0) {
      violations.forEach(violation => {
        const violationElement = document.createElement('div');
        violationElement.className = 'violation';
        violationElement.setAttribute('data-severity', violation.severity);
        
        violationElement.innerHTML = `
          <div class="violation-header">
            <span class="violation-title">${violation.title}</span>
            <span class="severity-badge" data-severity="${violation.severity}">${violation.severity}</span>
          </div>
          <p class="violation-description">${violation.description}</p>
        `;
        violationsDiv.appendChild(violationElement);
      });
    } else {
      violationsDiv.innerHTML = `
        <div class="violation" data-severity="LOW">
          <div class="violation-header">
            <span class="violation-title">No Major Issues Found</span>
            <span class="severity-badge" data-severity="LOW">LOW</span>
          </div>
          <p class="violation-description">
            No significant privacy concerns were detected in this document. 
            However, it's always good practice to read through terms and conditions carefully.
          </p>
        </div>`;
    }
  }

  // Event Listeners
  analyzeBtn.addEventListener('click', analyzeCurrentPage);
  retryBtn.addEventListener('click', analyzeCurrentPage);
  newAnalysisBtn.addEventListener('click', analyzeCurrentPage);
});
