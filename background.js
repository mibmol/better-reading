chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['styles.css']
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles.css']
    });
  }
});