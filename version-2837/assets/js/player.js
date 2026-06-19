(function () {
  var players = document.querySelectorAll("[data-player]");

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var source = video ? video.getAttribute("data-play") : "";
    var hls = null;

    function attach() {
      if (!video || !source) {
        return;
      }

      if (video.getAttribute("src")) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.setAttribute("src", source);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.setAttribute("src", source);
    }

    function start() {
      attach();

      if (layer) {
        layer.classList.add("is-hidden");
      }

      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!video.getAttribute("src")) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
      video.addEventListener("emptied", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    }
  });
})();
