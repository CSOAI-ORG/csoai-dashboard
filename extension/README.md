# SOAI - Safety of AI Reporter

A Chrome browser extension for reporting AI safety incidents directly from any website. Part of the CSOAI (Council of AIs) governance framework.

## Features

- **Quick Reporting**: Report AI safety incidents with one click
- **Context Menu Integration**: Right-click to report selected text or current page
- **Multiple Incident Types**: Bias, Privacy, Safety, Misinformation, Manipulation
- **Severity Levels**: Low, Medium, High, Critical
- **Automatic URL Capture**: Optionally include the current page URL
- **Screenshot Support**: Capture screenshots as evidence (coming soon)

## Installation

### From Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store once approved.

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `extension` folder from this repository
6. The SOAI icon should appear in your browser toolbar

## Usage

### Quick Report
1. Click the SOAI icon in your browser toolbar
2. Select the incident type
3. Enter the AI system name
4. Describe the incident
5. Select severity level
6. Click "Submit Report"

### Context Menu
1. Right-click on any page
2. Select "Report AI Safety Incident"
3. Choose to report the page or selected text
4. Complete the report form

## Configuration

### API Key (Optional)
For authenticated submissions with tracking:
1. Get an API key from [CSOAI Dashboard](https://csoai-dashboard.manus.space/api-keys)
2. Open extension settings
3. Enter your API key

### Floating Button
Enable a floating report button on all pages:
1. Open extension settings
2. Toggle "Show floating button"

## Privacy

- Reports are submitted to the CSOAI platform for review
- Page URLs are only included if you opt-in
- No browsing data is collected without explicit action
- See our [Privacy Policy](https://csoai-dashboard.manus.space/privacy) for details

## Development

### Project Structure
```
extension/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── background.js      # Service worker
├── content.js         # Content script
├── content.css        # Content styles
├── icons/             # Extension icons
└── README.md          # This file
```

### Building
No build step required - the extension uses vanilla JavaScript.

### Testing
1. Load the extension in developer mode
2. Open the popup and test the form
3. Check the console for any errors

## API Reference

The extension uses the CSOAI Watchdog API:

```javascript
// Submit a report
POST /api/trpc/watchdog.submit
{
  "json": {
    "title": "Incident title",
    "description": "Detailed description",
    "aiSystemName": "AI System Name",
    "incidentType": "bias|privacy|safety|misinformation|manipulation|other",
    "severity": "low|medium|high|critical",
    "sourceUrl": "https://example.com",
    "isPublic": true
  }
}
```

## Support

- [CSOAI Dashboard](https://csoai-dashboard.manus.space)
- [API Documentation](https://csoai-dashboard.manus.space/api-docs)
- [Report Issues](https://github.com/coai/extension/issues)

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

---

**CSOAI - Council of AIs**
*Building a safer AI future through collective oversight*
