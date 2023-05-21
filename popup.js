
const Color = {
  lavender: "#9464D0",
  gray: "#6b7280",
}

async function getCurrentTabHostname() {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return new URL(currentTab?.url).hostname
}


async function isHostActivated() {
  const [settings, hostname] = await Promise.all([
    chrome.storage.sync.get(),
    getCurrentTabHostname()
  ])

  const deactivatedHosts = settings.deactivatedHosts ?? []

  return {
    activated: !deactivatedHosts.find(host => host === hostname),
    hostname,
    deactivatedHosts,
  }
}

async function initializeForm() {
  const { activated } = await isHostActivated()
  document.getElementById("switchIcon").style.stroke = activated ? Color.lavender : Color.gray;
}



async function sendUpdateSetting(key, value) {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.tabs.sendMessage(activeTab.id, {
    action: "UpdateSetting",
    setting: { key, value }
  })

}

async function setCurrentUrl() {
  const hostname = await getCurrentTabHostname()
  document.getElementById("currentWebsite").textContent = hostname
}



document.addEventListener("DOMContentLoaded", () => {
  const activateButton = document.getElementById("activateButton");

  activateButton.addEventListener("click", async () => {

    const { activated, deactivatedHosts, hostname } = await isHostActivated()
    if (activated) {
      sendUpdateSetting("deactivatedHosts", [...deactivatedHosts, hostname])
    } else {
      sendUpdateSetting("deactivatedHosts", deactivatedHosts.filter(host => host !== hostname))
    }

    document.getElementById("switchIcon").style.stroke = !activated ? Color.lavender : Color.gray
  });

  initializeForm()
  setCurrentUrl()
});
