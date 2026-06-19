(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 6500);
    }
  }

  var list = document.querySelector("[data-card-list]");
  var filterInput = document.querySelector("[data-filter-input]");
  var sortSelect = document.querySelector("[data-sort-select]");

  if (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function normalize(text) {
      return String(text || "").toLowerCase();
    }

    function filterCards() {
      var keyword = normalize(filterInput ? filterInput.value : "");
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-category"));
        card.style.display = haystack.indexOf(keyword) > -1 ? "" : "none";
      });
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : "year";
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "title") {
          return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
        }
        if (mode === "hot") {
          return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
        }
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      filterCards();
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        filterInput.value = q;
      }
      filterInput.addEventListener("input", filterCards);
      filterCards();
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
      sortCards();
    }
  }
})();
