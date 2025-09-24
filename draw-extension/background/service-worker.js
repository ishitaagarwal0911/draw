// Background service worker for Canvas by Recess Club
// This runs in the background and can handle extension lifecycle events

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Canvas extension installed:', details.reason);
  
  // Set up initial storage or perform setup tasks
  if (details.reason === 'install') {
    // First installation
    chrome.storage.local.set({
      canvasInitialized: true,
      installDate: Date.now()
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Canvas extension starting up');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  // Handle different message types
  switch (request.type) {
    case 'CANVAS_SAVE':
      // Handle canvas save operations if needed
      break;
    case 'GET_STATS':
      // Return usage statistics
      chrome.storage.local.get(['installDate'], (result) => {
        sendResponse({ installDate: result.installDate });
      });
      return true; // Keep message channel open for async response
    default:
      console.log('Unknown message type:', request.type);
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('Storage changed:', changes, 'in', areaName);
});