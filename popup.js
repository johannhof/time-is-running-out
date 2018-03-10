browser.runtime.getBackgroundPage().then(function(page) {
  let sites = JSON.stringify(page.sites);
  let app = new Vue({
    el: '#app',
    data: {
      removeView: 0,
      sites: JSON.parse(sites),
    },
    methods: {
      toggleRemoveView(id) {
        if (this.removeView == id) {
          this.removeView = 0;
        } else {
          this.removeView = id;
        }
      },

      addSite() {
        page.addSite(this.pattern, this.time * 60);
      },

      removeSite(id) {
        page.removeSite(id);
      },
    },
    computed: {
      activeSite() {
        return this.sites.find((s) => s.active);
      },
      activeStyle() {
        let site = this.activeSite;
        if (site.currentTime / 60 < 1) {
          return {
            backgroundColor: "#ff0039",
            color: "white",
          };
        } else if (site.currentTime / 60 < 5) {
          return {
            backgroundColor: "#ffe900",
            color: "#0c0c0d",
          };
        }
        return {
          backgroundColor: "#058B00",
          color: "white",
        };
      }
    },
    filters: {
      formatTime(raw) {
        if (raw <= 0) {
          return "00:00";
        }

        let minutes = Math.floor(raw / 60);
        let seconds = raw - (minutes * 60);
        return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
      }
    },
  });

  function getData() {
    let serializedSites = JSON.stringify(page.sites);

    app.sites = JSON.parse(serializedSites);
    window.requestAnimationFrame(getData);
  }

  window.requestAnimationFrame(getData);
})
