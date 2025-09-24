// Content script for Canvas by Recess Club
// This script runs on web pages and can interact with page content

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  switch (request.type) {
    case 'CLEAR_CANVAS':
      // If this were a canvas page, we could clear it here
      console.log('Canvas clear requested');
      break;
    case 'EXPORT_CANVAS':
      // If this were a canvas page, we could export it here
      console.log('Canvas export requested');
      break;
    default:
      console.log('Unknown message type:', request.type);
  }
});

// Example: Add a floating button to quickly access canvas
function addCanvasButton() {
  // Only add on non-canvas pages
  if (window.location.protocol === 'chrome-extension:') return;
  
  const button = document.createElement('div');
  button.innerHTML = '📝';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #333;
    color: white;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10000;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: transform 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });
  
  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_CANVAS' });
  });
  
  button.title = 'Open Canvas';
  document.body.appendChild(button);
}

// Uncomment to enable floating canvas button on all pages
// addCanvasButton();