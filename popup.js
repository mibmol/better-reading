
const Color = {
  lavender: "#9464D0",
  gray: "#6b7280",
}


async function initializeForm() {
  const { activated } = await chrome.storage.sync.get()
  document.getElementById("switchIcon").style.stroke = activated ? Color.lavender : Color.gray;
  // document.getElementById("applyToButtons").checked = applyToButtons;
}

async function getCurrentTabHostname() {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return new URL(currentTab?.url).hostname

}

async function sendUpdateSetting(key, value) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  for (const { id: tabId } of tabs) {
    chrome.tabs.sendMessage(tabId, {
      action: "UpdateSetting",
      setting: { key, value }
    })
  }
}

async function setCurrentUrl() {
  const hostname = await getCurrentTabHostname()
  document.getElementById("currentWebsite").textContent = hostname

}

async function isHostActivated() {
  const [settings, hostname] = await Promise.all([
    chrome.storage.sync.get(["deactivatedHosts"]),
    getCurrentTabHostname()
  ])
  const deactivatedHosts = settings.deactivatedHosts ?? []

  return {
    activated: !deactivatedHosts.find(host => host === hostname),
    hostname,
    deactivatedHosts,
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const activateButton = document.getElementById("activateButton");

  activateButton.addEventListener("click", async () => {

    const { activated, deactivatedHosts, hostname } = await isHostActivated()

    if (activated) {
      sendUpdateSetting("deactivatedHosts", deactivatedHosts.filter(host => host === hostname))
    } else {
      deactivatedHosts.push(hostname)
      sendUpdateSetting("deactivatedHosts", deactivatedHosts)
    }
    document.getElementById("switchIcon").style.stroke = activated ? Color.lavender : Color.gray
  });

  // const applyToButtons = document.getElementById("applyToButtons");
  // applyToButtons.addEventListener("change", () => {
  //   sendUpdateSetting("applyToButtons", applyToButtons.checked)
  // })

  initializeForm()
  setCurrentUrl()
});