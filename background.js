/**
 * Background Service Worker
 * Handles persistent logic and messages
 */

console.log('AI Chess Assistant background script initialized');

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'log') {
    console.log('Content script log:', request.message);
  }
  
  sendResponse({ received: true });
});

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AI Chess Assistant installed');
    // Open welcome page if needed
    // chrome.tabs.create({ url: 'welcome.html' });
  }
});
