# AI Chess Assistant - Pure Chrome Extension

**Zero build process. Just load and play.** 🚀

A lightweight Chrome extension for real-time chess analysis on chess.com.

## ✅ What's Included

✅ Pure JavaScript - no TypeScript compilation  
✅ No build tools required - no Vite, no bundlers  
✅ No dependencies - just Chrome APIs  
✅ Runs instantly - load and use  
✅ Easy to modify - edit `.js` files directly

## 🚀 Quick Start

### Step 1: Load the Extension
1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Toggle **"Developer mode"** (top right corner)
4. Click **"Load unpacked"**
5. Select this folder

### Done! 🎉
The extension is now active on chess.com

## 📁 File Structure

```
AI-Chess-Assistant/
├── manifest.json       # Extension configuration
├── content.js          # Injects UI into chess.com
├── background.js       # Service worker
├── popup.html          # Extension popup UI
├── popup.js            # Popup interactions
├── assets/             # Extension icons (16x16, 48x48, 128x128)
├── package.json        # Metadata only (no dependencies!)
└── README.md           # This file
```

## 🎯 Features

- ✅ Real-time position analysis
- ✅ Board detection and evaluation
- ✅ Move suggestions
- ✅ Simple, lightweight, no dependencies
- ✅ No build process required

## 🔧 How It Works

### Content Script (`content.js`)
- Runs on chess.com pages
- Extracts board position
- Injects analysis UI
- Listens for messages

### Background Script (`background.js`)
- Service worker for background logic
- Handles message routing
- Persistent state

### Popup (`popup.html` / `popup.js`)
- User interface
- Quick action buttons
- Status display

## ✏️ Development

### Make Changes
1. Edit any `.js` or `.html` file
2. Go to `chrome://extensions/`
3. Click the **refresh icon** on the extension
4. Test on chess.com

**No build step. No npm install. Just edit and reload.**

## 🎮 How to Use

1. **Load the extension** (see Quick Start above)
2. **Go to chess.com**
3. **Click the extension icon** to open the popup
4. **Click "Analyze Position"** to analyze the current board
5. **Results appear** in the popup and on the board

## 🔧 Customize

### Add Your Own Analysis
Edit `content.js` and modify the `analyzePosition()` function:

```javascript
async function analyzePosition(fen) {
  // Add your chess engine logic here
  return {
    fen,
    bestMove: 'e2e4',
    evaluation: 0.5
  };
}
```

### Change Icons
Replace images in `assets/` folder:
- `icon-16.png` (16x16 pixels)
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

### Update Popup UI
Modify `popup.html` and `popup.js` for custom interface.

## 🐛 Debugging

### Check Console Logs
1. Open developer tools on chess.com (F12)
2. Go to **Console** tab
3. Look for messages from the extension

### View Service Worker Logs
1. Go to `chrome://extensions/`
2. Find "AI Chess Assistant"
3. Click "details"
4. Click "Service Worker" link to see logs

## 📦 Distribution

### Create a ZIP File
```bash
zip -r ai-chess-assistant.zip . \
  --exclude="*.git*" \
  --exclude="node_modules/*" \
  --exclude=".gitignore"
```

### Share with Others
1. Create the ZIP file
2. Share the file
3. Others extract it and load unpacked in Chrome

## 🔐 Permissions

The extension requests minimal permissions:
- `storage` - Save user preferences
- `activeTab` - Access the current tab
- Host permissions for chess.com only

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Feel free to fork, modify, and improve!

---

**Version:** 4.0.0  
**Status:** Pure JavaScript, no build required ✅  
**Last Updated:** 2026-07-15
