// Options page functionality for Canvas by Recess Club

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateStorageInfo();
  
  // Save settings
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Clear data
  document.getElementById('clearData').addEventListener('click', clearAllData);
});

function loadSettings() {
  chrome.storage.local.get([
    'autosaveInterval',
    'defaultTheme', 
    'showGrid'
  ], (result) => {
    // Set form values from stored settings
    if (result.autosaveInterval) {
      document.getElementById('autosaveInterval').value = result.autosaveInterval;
    }
    if (result.defaultTheme) {
      document.getElementById('defaultTheme').value = result.defaultTheme;
    }
    if (result.showGrid !== undefined) {
      document.getElementById('showGrid').checked = result.showGrid;
    }
  });
}

function saveSettings() {
  const settings = {
    autosaveInterval: parseInt(document.getElementById('autosaveInterval').value),
    defaultTheme: document.getElementById('defaultTheme').value,
    showGrid: document.getElementById('showGrid').checked
  };
  
  chrome.storage.local.set(settings, () => {
    // Show save confirmation
    const status = document.getElementById('saveStatus');
    status.textContent = 'Settings saved!';
    status.style.color = 'hsl(var(--primary))';
    
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all canvas data? This cannot be undone.')) {
    chrome.storage.local.clear(() => {
      const status = document.getElementById('saveStatus');
      status.textContent = 'All data cleared!';
      status.style.color = 'hsl(var(--destructive))';
      updateStorageInfo();
    });
  }
}

function updateStorageInfo() {
  chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
    const mb = (bytesInUse / (1024 * 1024)).toFixed(2);
    document.getElementById('storageInfo').textContent = `Storage used: ${mb} MB`;
  });
}