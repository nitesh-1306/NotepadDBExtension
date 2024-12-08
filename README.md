# Notepad DB - Chrome Browser Extension

## Overview

NotepadDB is a Chrome browser extension that provides a simple, seamless note-taking experience with dual storage capabilities - saving notes locally and syncing them to GitHub Gists.

## Features

- 📝 Quick note creation and editing
- 💾 Automatic local storage
- 🌐 GitHub Gist synchronization
- 🔒 Secure authentication with GitHub token
- 🖥️ Lightweight and easy-to-use interface

## Prerequisites

- Google Chrome Browser
- GitHub Account
- GitHub Personal Access Token with Gist permissions

## Installation

### Manual Installation

1. Clone or download the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select the extension directory

## Configuration

### GitHub Token Setup

1. Go to GitHub > Settings > Developer Settings > Personal Access Tokens
2. Generate a new token with the following scopes:
   - `gist` (Full control of gists)
3. Copy the generated token

### Extension Configuration

1. Open the extension
2. Navigate to Settings/Configuration
3. Paste your GitHub Personal Access Token
4. Click "Save"

## How to Use

1. Click the extension icon to open the notepad
2. Write your notes
3. Notes are automatically saved locally
4. To sync with GitHub Gist, ensure you've configured your token
5. Extension will automatically push/pull notes to/from GitHub


## Security

- GitHub token is stored securely using Chrome's storage API
- Only Gist-related permissions are requested
- No third-party tracking or data collection

## Permissions Required

- `storage`: Local note saving
- `https://api.github.com/`: Gist API interactions

## Troubleshooting

- Ensure GitHub token has correct permissions
- Check browser console for any error messages
- Verify internet connectivity for Gist sync

## License

Distributed under the MIT License. See `LICENSE` for more information.
