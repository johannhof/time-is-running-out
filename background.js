browser.storage.local.get("sites").then(init);

function init({sites}) {
  window.sites = sites || [];

  window.addSite = function(pattern, time) {
    window.sites.push({
      pattern,
      time,
      currentTime: time,
      active: false,
    });
  }

  let previousActive = null;

  async function tick() {
    let tabs = await browser.tabs.query({active:true});

    let activeTab;
    for (let tab of tabs) {
      let win = await browser.windows.get(tab.windowId);
      if (win.focused) {
        activeTab = tab;
        break;
      }
    }

    if (!activeTab) {
      return;
    }

    if (previousActive) {
      previousActive.active = false;
      previousActive = null;
    }

    let rule = window.sites.find(({pattern}) => activeTab.url.includes(pattern));

    if (!rule) {
      browser.browserAction.setBadgeText({
        text: "",
      });
      return;
    }

    rule.active = true;
    previousActive = rule;

    rule.currentTime--;

    if (rule.currentTime < 60) {
      browser.browserAction.setBadgeText({
        text: rule.currentTime.toString(),
      });
      browser.browserAction.setBadgeBackgroundColor({color: "#ff0039"});
    } else {
      browser.browserAction.setBadgeText({
        text: Math.floor(rule.currentTime / 60).toString(),
      });

      if (rule.currentTime / 60 < 5) {
        browser.browserAction.setBadgeBackgroundColor({color: "#a47f00"});
      } else {
        browser.browserAction.setBadgeBackgroundColor({color: "#058B00"});
      }
    }

    if (rule.currentTime == 5 * 60) {
      browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icon.svg"),
        "title": "Time is Running Out",
        "message": `5 Minutes remaining for ${rule.pattern}.`,
      });
    }

    if (rule.currentTime == 1 * 60) {
      browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icon.svg"),
        "title": "Time is Running Out",
        "message": `1 Minute remaining for ${rule.pattern}.`,
      });
    }

    if (rule.currentTime == 10) {
      browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icon.svg"),
        "title": "Time is Running Out",
        "message": "10 Seconds, save your stuff!!!",
      });
    }

    if (rule.currentTime <= 0) {
      browser.tabs.remove(activeTab.id);
      browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icon.svg"),
        "title": "Time Ran Out!",
        "message": `Closed the tab because the time for ${rule.pattern} has run out.`,
      });
    }
  };

  setInterval(tick, 1000);

  // Periodically store the current state.
  async function saveRules() {
    await browser.storage.local.set({
      sites: window.sites,
    });
    window.requestIdleCallback(saveRules, {timeout: 15000});
  }

  window.requestIdleCallback(saveRules, {timeout: 15000});
}
