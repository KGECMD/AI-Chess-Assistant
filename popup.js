/**
 * Popup Script
 * Handles user interactions from the extension popup
 */

const statusDiv = document.getElementById('status');
const analyzeBtn = document.getElementById('analyze-btn');
const toggleBtn = document.getElementById('toggle-btn');

analyzeBtn.addEventListener('click', async () => {
  try {
    statusDiv.textContent = 'Analyzing...';
    
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePosition',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    });
    
    statusDiv.textContent = response.success ? '✅ Analysis complete' : '❌ Analysis failed';
  } catch (error) {
    statusDiv.textContent = '❌ Error: ' + error.message;
    console.error('Error:', error);
  }
});

toggleBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleDisplay'
    });
    
    statusDiv.textContent = '✅ Display toggled';
  } catch (error) {
    statusDiv.textContent = '❌ Error: ' + error.message;
  }
});

// Check if extension is enabled
chrome.storage.local.get(['enabled'], (result) => {
  const enabled = result.enabled !== false;
  statusDiv.textContent = enabled ? '✅ Ready to analyze' : '⏸️ Extension paused';
});
