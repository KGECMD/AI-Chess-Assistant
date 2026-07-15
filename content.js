/**
 * Content Script - Runs on chess.com
 * Injects UI and handles board analysis with autoplay
 */

console.log('AI Chess Assistant loaded on chess.com');

let autoplayEnabled = false;
let isAutoplayRunning = false;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePosition') {
    analyzePosition(request.fen).then(result => {
      sendResponse({ success: true, result });
    });
    return true;
  }
  if (request.action === 'getBoardPosition') {
    const position = extractBoardPosition();
    sendResponse({ success: true, position });
  }
  if (request.action === 'toggleAutoplay') {
    autoplayEnabled = !autoplayEnabled;
    console.log('Autoplay:', autoplayEnabled ? 'ON' : 'OFF');
    if (autoplayEnabled) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    sendResponse({ success: true, autoplayEnabled });
  }
  if (request.action === 'getAutoplayStatus') {
    sendResponse({ success: true, autoplayEnabled });
  }
});

/**
 * Extract board position from chess.com
 */
function extractBoardPosition() {
  try {
    const boardElement = document.querySelector('[data-testid="board"]');
    if (!boardElement) return null;
    
    return {
      timestamp: Date.now(),
      boardFound: true
    };
  } catch (error) {
    console.error('Error extracting board position:', error);
    return null;
  }
}

/**
 * Analyze chess position
 */
async function analyzePosition(fen) {
  try {
    if (!fen) return { error: 'No FEN provided' };
    
    // Generate a "best move" based on simple heuristics
    // In a real implementation, this would use a chess engine like Stockfish
    const bestMove = generateBestMove();
    
    return {
      fen,
      evaluated: true,
      bestMove,
      evaluation: Math.random() * 2 - 1
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { error: error.message };
  }
}

/**
 * Generate a best move (simplified)
 */
function generateBestMove() {
  const moves = [
    'e2e4', 'd2d4', 'c2c4', 'g1f3',
    'e7e5', 'd7d5', 'c7c5', 'g8f6'
  ];
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Play the best move automatically
 */
async function playAutoMove() {
  if (!autoplayEnabled || isAutoplayRunning) return;
  
  isAutoplayRunning = true;
  
  try {
    // Extract current position
    const position = extractBoardPosition();
    if (!position) {
      isAutoplayRunning = false;
      return;
    }
    
    // Analyze position
    const analysis = await analyzePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    
    if (analysis.bestMove) {
      // Simulate move - in real implementation, interact with chess.com's UI
      console.log('Playing move:', analysis.bestMove);
      
      // Update status on screen
      const statusDiv = document.getElementById('autoplay-status');
      if (statusDiv) {
        statusDiv.textContent = `Playing: ${analysis.bestMove}`;
      }
      
      // Wait before next move
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  } catch (error) {
    console.error('Autoplay error:', error);
  }
  
  isAutoplayRunning = false;
  
  // Continue autoplay if enabled
  if (autoplayEnabled) {
    setTimeout(playAutoMove, 2000);
  }
}

/**
 * Start autoplay
 */
function startAutoplay() {
  autoplayEnabled = true;
  console.log('Autoplay started');
  updateUIStatus();
  playAutoMove();
}

/**
 * Stop autoplay
 */
function stopAutoplay() {
  autoplayEnabled = false;
  isAutoplayRunning = false;
  console.log('Autoplay stopped');
  updateUIStatus();
}

/**
 * Update UI to show autoplay status
 */
function updateUIStatus() {
  const statusDiv = document.getElementById('autoplay-status');
  if (statusDiv) {
    statusDiv.textContent = autoplayEnabled ? '⚙️ Autoplay ON' : '⏸️ Autoplay OFF';
    statusDiv.style.color = autoplayEnabled ? '#4CAF50' : '#ff9800';
  }
}

/**
 * Inject UI elements into the page
 */
function injectUI() {
  // Check if already injected
  if (document.getElementById('chess-ai-container')) return;
  
  const container = document.createElement('div');
  container.id = 'chess-ai-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 2px solid #4CAF50;
    border-radius: 8px;
    padding: 15px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: Arial, sans-serif;
    min-width: 220px;
  `;
  
  container.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px;">♟️ Chess AI</div>
    <button id="analyze-btn" style="
      width: 100%;
      padding: 8px 12px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 8px;
      font-weight: bold;
    ">Analyze</button>
    <button id="autoplay-btn" style="
      width: 100%;
      padding: 8px 12px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Start Autoplay</button>
    <div id="autoplay-status" style="
      margin-top: 10px; 
      padding: 8px; 
      background: #f0f0f0; 
      border-radius: 4px; 
      font-size: 11px; 
      text-align: center;
      color: #666;
    ">⏸️ Autoplay OFF</div>
    <div id="analysis-result" style="margin-top: 8px; font-size: 11px; color: #333;"></div>
  `;
  
  document.body.appendChild(container);
  
  // Analyze button
  document.getElementById('analyze-btn').addEventListener('click', async () => {
    const resultDiv = document.getElementById('analysis-result');
    resultDiv.textContent = 'Analyzing...';
    
    const result = await analyzePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    resultDiv.textContent = result.bestMove ? `Best: ${result.bestMove}` : 'Ready';
  });
  
  // Autoplay button
  const autoplayBtn = document.getElementById('autoplay-btn');
  autoplayBtn.addEventListener('click', () => {
    autoplayEnabled = !autoplayEnabled;
    autoplayBtn.textContent = autoplayEnabled ? 'Stop Autoplay' : 'Start Autoplay';
    autoplayBtn.style.background = autoplayEnabled ? '#f44336' : '#2196F3';
    
    if (autoplayEnabled) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  });
  
  updateUIStatus();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}
