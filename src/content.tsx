// This script runs in the context of web pages
console.log('Content script loaded');

// Content script that runs in the context of web pages
function getPageContent() {
  return {
    title: document.title,
    content: document.body.innerText,
    url: window.location.href
  };
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContent') {
    sendResponse(getPageContent());
  }
  return true;
});