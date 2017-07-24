function formatTime(raw) {
  let minutes = Math.floor(raw / 60);
  let seconds = raw - (minutes * 60);
  return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

browser.runtime.getBackgroundPage().then(function(page) {
  let rulesContainer = document.getElementById("rules");
  let activeRule = document.getElementById("active-rule");
  let activeTime = document.getElementById("active-time");
  let activeNote = document.getElementById("active-note");
  function fillRules() {
    rulesContainer.innerHTML = "";
    let someActive = false;
    for (let site of page.sites) {
      let rule = document.createElement("li");
      let pattern = document.createElement("span");
      pattern.textContent = site.pattern;
      pattern.className = "pattern";
      let time = document.createElement("span");
      time.textContent = formatTime(site.currentTime) + "/" + formatTime(site.time);
      time.className = "time";
      rule.appendChild(pattern);
      rule.appendChild(time);
      rulesContainer.appendChild(rule);

      if (site.active) {
        someActive = true;
        if (site.currentTime / 60 < 1) {
          activeRule.style.backgroundColor = "#ff0039";
          activeRule.style.color = "white";
        } else if (site.currentTime / 60 < 5) {
          activeRule.style.backgroundColor = "#ffe900";
          activeRule.style.color = "#0c0c0d";
        } else {
          activeRule.style.backgroundColor = "#058B00";
          activeRule.style.color = "white";
        }
        activeTime.textContent = formatTime(site.currentTime);
        activeNote.textContent = `Remaining for ${site.pattern} today.`;
      }
    }

    if (someActive) {
      activeRule.style.display = "block";
    } else {
      activeRule.style.display = "none";
    }
  }
  fillRules();
  setInterval(fillRules, 1000)

  let patternInput = document.getElementById("pattern");
  let timeInput = document.getElementById("time");
  let newRuleForm = document.getElementById("new-rule-form");
  newRuleForm.addEventListener("submit", function(event) {
    page.addSite(
      patternInput.value,
      parseInt(timeInput.value, 10) * 60,
    );
  });
})
