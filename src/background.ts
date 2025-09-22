// Simple background script for Plasmo
console.log("Background script initialized")

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message)
  sendResponse({ status: "success" })
  return true
})