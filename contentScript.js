const actionElements = ["BUTTON", "A"]

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

async function prepareNodes() {
  const docWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // if (!node.parentNode) return NodeFilter.FILTER_REJECT;
        // if (actionElements.includes(node.parentNode.nodeName)) {
        //   return NodeFilter.FILTER_REJECT
        // }
        return NodeFilter.FILTER_ACCEPT
      }
    },
    false
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

async function applySetting() {
  const { activated } = await chrome.storage.sync.get()
  activated ?
    document.querySelectorAll(".better-reading-element").forEach((node) => {
      const fontWeight = window.getComputedStyle(node).getPropertyValue('font-weight')
      if (fontWeight !== "bold" && Number.parseInt(fontWeight) < 600) {
        node.classList.add("better-reading-boldword")
      }
    })
    : document.querySelectorAll(".better-reading-element").forEach((node) => {
      node.classList.remove("better-reading-boldword")
    })
}

; (() => {
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.action === "UpdateSetting") {
      const { key, value } = request.setting
      await chrome.storage.sync.set({ [key]: value });
      applySetting()
    }
  });
  prepareNodes()
  applySetting()
})()