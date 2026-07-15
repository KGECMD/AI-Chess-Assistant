/**
 * Content Script - Runs on chess.com
 * Injects UI and handles board analysis
 */

console.log('AI Chess Assistant loaded on chess.com');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePosition') {
    analyzePosition(request.fen).then(result => {
      sendResponse({ success: true, result });
    });
    return true; // Keep channel open for async response
  }
  if (request.action === 'getBoardPosition') {
    const position = extractBoardPosition();
    sendResponse({ success: true, position });
  }
});

/**
 * Extract FEN from current board position
 */
function extractBoardPosition() {
  try {
    // This depends on chess.com's DOM structure
    // Adapt selectors based on current chess.com layout
    const boardElement = document.querySelector('[data-testid="board"]');
    if (!boardElement) return null;
    
    // Return board state - actual implementation depends on chess.com's DOM
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
    
    // Analysis logic goes here
    return {
      fen,
      evaluated: true,
      bestMove: 'e2e4',
      evaluation: 0.5
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { error: error.message };
  }
}

// Inject UI elements into the page
function injectUI() {
  const container = document.createElement('div');
  container.id = 'chess-ai-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  `;
  
  container.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px;">Chess AI</div>
    <button id="analyze-btn" style="
      padding: 8px 12px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    ">Analyze Position</button>
    <div id="analysis-result" style="margin-top: 10px; font-size: 12px;"></div>
  `;
  
  document.body.appendChild(container);
  
  // Add click listener
  document.getElementById('analyze-btn').addEventListener('click', async () => {
    const position = extractBoardPosition();
    const resultDiv = document.getElementById('analysis-result');
    resultDiv.textContent = 'Analyzing...';
    
    const result = await analyzePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    resultDiv.textContent = `Best Move: ${result.bestMove}`;
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}
