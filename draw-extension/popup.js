// Popup functionality for Canvas by Recess Club

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  
  // Open canvas (new tab)
  document.getElementById('openCanvas').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://newtab/' });
    window.close();
  });
  
  // Clear canvas
  document.getElementById('clearCanvas').addEventListener('click', () => {
    if (confirm('Clear the entire canvas? This cannot be undone.')) {
      chrome.storage.local.remove(['canvasData'], () => {
        // Send message to canvas if it's open
        chrome.tabs.query({ url: 'chrome://newtab/' }, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_CANVAS' });
          });
        });
        updateStats();
      });
    }
  });
  
  // Export canvas
  document.getElementById('exportCanvas').addEventListener('click', () => {
    chrome.tabs.query({ url: 'chrome://newtab/' }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EXPORT_CANVAS' });
        window.close();
      } else {
        alert('Please open the canvas first to export.');
      }
    });
  });
  
  // Open settings
  document.getElementById('openSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
});

function updateStats() {
  // Get storage usage
  chrome.storage.local.getBytesInUse(['canvasData'], (bytesInUse) => {
    const kb = (bytesInUse / 1024).toFixed(1);
    document.getElementById('storageUsed').textContent = `Storage: ${kb} KB used`;
  });
  
  // Get last saved time
  chrome.storage.local.get(['lastSaved'], (result) => {
    const lastSaved = document.getElementById('lastSaved');
    if (result.lastSaved) {
      const date = new Date(result.lastSaved);
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lastSaved.textContent = `Last saved: ${timeString}`;
    } else {
      lastSaved.textContent = 'No canvas data';
    }
  });
}