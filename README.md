# TERMSinator - Chrome Extension

A Chrome extension that uses OpenAI's GPT to analyze privacy policies and terms of service, highlighting potential privacy concerns and user rights issues.

## Features

- Quick analysis of privacy policies and terms of service
- Identifies top 3 most concerning privacy violations
- Easy-to-understand explanations with severity ratings
- Privacy-focused analysis using OpenAI's GPT

## Installation

1. Clone this repository
2. Create a `config.js` file in the root directory with your OpenAI API key:
   ```javascript
   const config = {
       OPENAI_API_KEY: 'your-api-key-here'
   };
   export default config;
   ```
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extension directory

## Configuration

Before using the extension, make sure to:
1. Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/)
2. Add your API key to `config.js`

## Usage

1. Navigate to any website with terms of service or privacy policy
2. Click the extension icon
3. Select the text you want to analyze
4. Click "Analyze" to get insights about potential privacy concerns

## Security Note

The `config.js` file containing your API key is listed in `.gitignore` to prevent accidentally committing sensitive information. Make sure to keep your API key secure and never share it publicly.

## License

MIT License - See LICENSE file for details
