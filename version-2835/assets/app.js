(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav-links");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var heroCards = Array.prototype.slice.call(document.querySelectorAll(".hero-card"));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;
    function showHero(index) {
      if (!heroCards.length) {
        return;
      }
      heroIndex = (index + heroCards.length) % heroCards.length;
      heroCards.forEach(function (card, i) {
        card.classList.toggle("is-active", i === heroIndex);
      });
      heroDots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === heroIndex);
      });
    }
    heroDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showHero(i);
      });
    });
    if (heroCards.length > 1) {
      setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
    showHero(0);

    var filterInput = document.querySelector(".filter-search");
    var typeSelect = document.querySelector(".filter-type");
    var yearSelect = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    function applyFilters() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = !type || cardType === type;
        var matchYear = !year || cardYear === year;
        card.style.display = matchQuery && matchType && matchYear ? "" : "none";
      });
    }
    [filterInput, typeSelect, yearSelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilters);
        item.addEventListener("change", applyFilters);
      }
    });

    var heroForm = document.querySelector(".hero-search");
    if (heroForm) {
      heroForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = heroForm.querySelector("input");
        var q = input ? input.value.trim() : "";
        window.location.href = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
      });
    }

    var searchPageInput = document.querySelector(".search-page-input");
    if (searchPageInput) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      if (queryValue) {
        searchPageInput.value = queryValue;
        if (filterInput) {
          filterInput.value = queryValue;
        }
        applyFilters();
      }
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(function (box) {
      var video = box.querySelector("video");
      var layer = box.querySelector(".play-layer");
      var button = box.querySelector(".play-button");
      if (!video) {
        return;
      }
      var sourceNode = video.querySelector("source");
      var sourceUrl = sourceNode ? sourceNode.getAttribute("src") : video.getAttribute("src");
      var loaded = false;
      function loadVideo() {
        if (loaded || !sourceUrl) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }
      function startVideo() {
        loadVideo();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }
      if (layer) {
        layer.addEventListener("click", startVideo);
      }
      if (button) {
        button.addEventListener("click", startVideo);
      }
      video.addEventListener("click", loadVideo);
    });
  });
})();
