# AI Chess Assistant - Chrome Extension

A pure JavaScript Chrome extension for real-time chess analysis on chess.com.

## 🚀 Quick Start

**No build process needed!** Just load it directly in Chrome:

1. Clone or download this repository
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select this folder
6. Done! The extension is active on chess.com

## 📁 File Structure

```
.
├── manifest.json      # Extension configuration
├── content.js         # Runs on chess.com pages
├── background.js      # Service worker
├── popup.html         # Extension popup UI
├── popup.js           # Popup interactions
├── assets/            # Extension icons
└── README.md          # This file
```

## 🎯 Features

- ✅ Real-time position analysis
- ✅ Board detection and evaluation
- ✅ Move suggestions
- ✅ Simple, lightweight, no dependencies
- ✅ No build process required

## 📝 How It Works

1. **Content Script** (`content.js`) - Runs on chess.com, extracts board position, injects UI
2. **Background Script** (`background.js`) - Handles persistent logic and message routing
3. **Popup** (`popup.html/js`) - User interface for quick actions

## 🔧 Development

To modify the extension:

1. Edit `.js` files directly
2. Reload the extension in `chrome://extensions/`
3. Test on chess.com

No compilation, transpiling, or bundling needed!

## 📦 Installation in Chrome

### From Repository (Development)
```
chrome://extensions/ → Load unpacked → Select folder
```

### From ZIP (Distribution)
1. Create a ZIP file of this folder
2. Extract it
3. Load unpacked in Chrome

## 🤝 Contributing

Feel free to modify and improve the extension. Just reload it in Chrome to see changes.

## 📄 License

MIT License - See LICENSE file

## 🙋 Support

For issues or questions, check the extension console (F12 when on chess.com).

---

**Version:** 4.0.1  
**Last Updated:** 2024
