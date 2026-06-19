(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilter() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var section = scope.closest("section") || document;
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var grid = section.querySelector("[data-listing-grid]");
      var empty = section.querySelector("[data-empty-state]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-layout-button]"));
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && input && input.hasAttribute("data-query-input")) {
        input.value = initialQuery;
      }

      function apply() {
        var query = text(input && input.value);
        var yearValue = text(year && year.value);
        var typeValue = text(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search"));
          var cardYear = text(card.getAttribute("data-year"));
          var cardType = text(card.getAttribute("data-type"));
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible > 0;
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var view = button.getAttribute("data-layout-button");
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          grid.classList.toggle("is-list", view === "list");
        });
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var media = box.getAttribute("data-media");
      var hls = null;
      var mounted = false;
      if (!video || !media) {
        return;
      }

      function mount() {
        if (mounted) {
          return;
        }
        mounted = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(media);
          hls.attachMedia(video);
        } else {
          video.src = media;
        }
      }

      function start(event) {
        if (event) {
          event.preventDefault();
        }
        mount();
        box.classList.add("is-playing");
        video.controls = true;
        var playTask = video.play();
        if (playTask && playTask.catch) {
          playTask.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });

      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilter();
    setupPlayers();
  });
})();
