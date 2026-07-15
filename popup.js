/**
 * Popup Script
 * Handles user interactions from the extension popup
 */

const statusDiv = document.getElementById('status');
const statusIndicator = document.getElementById('status-indicator');
const analyzeBtn = document.getElementById('analyze-btn');
const autoplayBtn = document.getElementById('autoplay-btn');

let isAutoplayActive = false;

// Analyze button
analyzeBtn.addEventListener('click', async () => {
  try {
    statusDiv.textContent = 'Analyzing...';
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePosition',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    });
    
    if (response.success) {
      statusDiv.textContent = `✅ Best Move: ${response.result.bestMove}`;
    } else {
      statusDiv.textContent = '❌ Analysis failed';
    }
  } catch (error) {
    statusDiv.textContent = '⚠️ Not on chess.com';
    console.error('Error:', error);
  }
});

// Autoplay button
autoplayBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    isAutoplayActive = !isAutoplayActive;
    
    // Send toggle message
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleAutoplay'
    });
    
    // Update UI
    autoplayBtn.textContent = isAutoplayActive ? '⏸️ Stop Autoplay' : '▶️ Start Autoplay';
    autoplayBtn.classList.toggle('active', isAutoplayActive);
    
    statusDiv.textContent = isAutoplayActive ? '✅ Autoplay running...' : '⏹️ Autoplay stopped';
    statusDiv.classList.toggle('active', isAutoplayActive);
    
    // Update indicator
    if (isAutoplayActive) {
      statusIndicator.textContent = '🟢 ACTIVE';
      statusIndicator.style.color = '#4CAF50';
    } else {
      statusIndicator.textContent = '⏸️ OFF';
      statusIndicator.style.color = '#2196F3';
    }
  } catch (error) {
    statusDiv.textContent = '⚠️ Error: ' + error.message;
    console.error('Error:', error);
  }
});

// Check autoplay status on load
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length === 0) return;
  
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getAutoplayStatus' }, (response) => {
    if (response && response.success) {
      isAutoplayActive = response.autoplayEnabled;
      autoplayBtn.textContent = isAutoplayActive ? '⏸️ Stop Autoplay' : '▶️ Start Autoplay';
      autoplayBtn.classList.toggle('active', isAutoplayActive);
      
      if (isAutoplayActive) {
        statusIndicator.textContent = '🟢 ACTIVE';
        statusIndicator.style.color = '#4CAF50';
      }
    }
  });
});

// Set initial status
chrome.storage.local.get(['enabled'], (result) => {
  const enabled = result.enabled !== false;
  statusDiv.textContent = enabled ? '✅ Ready' : '⏸️ Paused';
});
