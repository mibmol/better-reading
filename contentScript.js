const excludeElements = ["BUTTON", "A", "SVG", "STYLE", "SCRIPT"]
let nodesReady = false

function getSplitIndex(wordLength = 0) {
  if (wordLength <= 3) {
    return 1
  }
  else if (wordLength <= 10) {
    return Math.floor(wordLength / 2)
  }
  else {
    return 6
  }
}

function addSpanNodeToWords(sentence) {
  return sentence.replace(/\b\w+\b/g, (match) => {
    const index = getSplitIndex(match.length)
    return `<span class="better-reading-element">${match.slice(0, index)}</span>${match.slice(index)}`;
  });
}

function prepareNodes() {
  const docWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => excludeElements.includes(node.parentNode?.nodeName) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT

    }
  );
  const nodes = [];
  let currentNode
  while (currentNode = docWalker.nextNode()) {
    nodes.push(currentNode);
  }
  for (const node of nodes) {
    const wrappedText = addSpanNodeToWords(node.nodeValue);
    const div = document.createElement('div');
    div.innerHTML = wrappedText;
    const fragment = document.createDocumentFragment();
    while (div.firstChild) {
      fragment.appendChild(div.firstChild);
    }
    const parentNode = node.parentNode;
    parentNode.replaceChild(fragment, node);
  }
}

async function isActivated(deactivatedHosts = []) {
  const currentHost = window.location.hostname
  return !deactivatedHosts.find(host => host === currentHost)
}

async function applySetting() {
  const { deactivatedHosts } = await chrome.storage.sync.get()
  const activated = await isActivated(deactivatedHosts)

  document.querySelectorAll(".better-reading-element").forEach((node) => {
    if (activated) {
      const fontWeight = window.getComputedStyle(node).getPropertyValue('font-weight')
      if (fontWeight !== "bold" && Number.parseInt(fontWeight) < 600) {
        node.classList.add("better-reading-boldword")
      }
    } else {
      node.classList.remove("better-reading-boldword")
    }
  })

}


chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === "UpdateSetting") {
    const { key, value } = request.setting
    await chrome.storage.sync.set({ [key]: value });
    if (!nodesReady) {
      prepareNodes()
      nodesReady = true
    }
    applySetting()
  }
});

function appendStyles() {
  const style = document.createElement('style');
  style.innerHTML = '.better-reading-boldword { font-weight: 600; }';
  document.head.appendChild(style)
}


async function init() {
  appendStyles()
  const { deactivatedHosts } = chrome.storage.sync.get()
  const activated = await isActivated(deactivatedHosts)
  if (activated) {
    prepareNodes()
    nodesReady = true
    applySetting()
  }
}

init()


