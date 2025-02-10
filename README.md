# TERMSinator - Chrome Extension

A Chrome extension powered by OpenAI's GPT that acts as your personal legal assistant, analyzing privacy policies and terms of service to identify potential privacy concerns, data handling issues, and user rights violations. It provides clear, actionable insights with real-world examples to help users understand the implications of accepting terms and conditions.

## Features

- Quick analysis of privacy policies and terms of service
- Identifies privacy violations with severity ratings (High, Medium, Low)
- Easy-to-understand explanations with real-world illustrative examples
- Configurable settings:
  - OpenAI API model selection (GPT-3.5 Turbo, GPT-4 Turbo, GPT-4o Mini)
  - Customizable number of top results (3, 5, 10, or all violations)
  - Secure API key management
- Privacy-focused analysis using OpenAI's GPT
- Visual severity indicators and interactive results display

## Installation

1. Clone this repository
2. Copy the configuration template:
   ```bash
   cp config.js.example config.js
   ```
3. Edit `config.js` with your OpenAI API key:
   ```javascript
   const config = {
        OPENAI_API_KEY: 'your-api-key-here',
        OPENAI_API_MODEL: 'gpt-4o-mini',
        TOP_K_RESULTS_SEVERITY: 3,
   };
   export default config;
   ```
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the extension directory

## Configuration

Before using the extension, make sure to:
1. Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/)
2. Configure your settings through the extension's interface (gear on the top-right corner of the chrome pop-up):
   - Add your API key
   - Select preferred GPT model
   - Set number of results to display

## Usage

1. Navigate to any website with terms of service or privacy policy
2. Click the extension icon
3. Click "Analyze Terms & Conditions" button to get insights about potential privacy concerns
4. Review the violations, their severity, and short summary of the potential violation
5. Use the book icon to view illustrative examples for each violation

## Security Note

The `config.js` file containing your API key is listed in `.gitignore` to prevent accidentally committing sensitive information. Make sure to keep your API key secure and never share it publicly.

## Roadmap

### Topic Focus
- [ ] Add ability to focus analysis on specific topics of interest
- [ ] Implement customizable privacy concern categories
- [ ] Allow users to prioritize certain types of violations

### Memory Integration
- [ ] Implement persistent storage for analysis results
- [ ] Add comparison feature for tracking T&C changes over time
- [ ] Create history of accepted terms across different services
- [ ] Cache analysis results to avoid redundant API calls

### Policy Alternatives
- [ ] Build database of analyzed terms and conditions
- [ ] Implement recommendation system for alternative services
- [ ] Add comparative analysis between similar services
- [ ] Create privacy score ranking system

### Chrome Extension
- [ ] Submit extension to Googlge Chrome extension store reviwing process

## License

MIT License - See LICENSE file for details