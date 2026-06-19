(() => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  const setHeader = () => {
    if (!header) {
      return;
    }
    header.classList.toggle("is-solid", window.scrollY > 24);
  };

  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
      });
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const nextButton = hero.querySelector("[data-hero-next]");
    const prevButton = hero.querySelector("[data-hero-prev]");
    let active = 0;
    let timer = null;

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === active);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(active + 1), 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        show(index);
        start();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        show(active + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        show(active - 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  document.querySelectorAll("[data-filter-list]").forEach((list) => {
    const section = list.closest("section") || document;
    const input = section.querySelector("[data-filter-input]");
    const chips = Array.from(section.querySelectorAll("[data-filter]"));
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    let chipValue = "全部";

    const normalize = (value) => (value || "").toString().trim().toLowerCase();

    const apply = () => {
      const keyword = normalize(input ? input.value : "");
      const chip = normalize(chipValue);

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.innerText
        ].join(" "));

        const keywordMatch = !keyword || haystack.includes(keyword);
        const chipMatch = chip === "全部" || haystack.includes(chip);
        card.classList.toggle("is-hidden", !(keywordMatch && chipMatch));
      });
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        chipValue = chip.dataset.filter || "全部";
        apply();
      });
    });

    apply();
  });
})();

function initMoviePlayer(videoId, overlayId, source) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !overlay || !source) {
    return;
  }

  let ready = false;
  let hlsInstance = null;

  const load = () => {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const play = () => {
    load();
    overlay.classList.add("hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        overlay.classList.remove("hidden");
      });
    }
  };

  overlay.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => {
    overlay.classList.add("hidden");
  });
  video.addEventListener("pause", () => {
    if (!video.ended) {
      overlay.classList.remove("hidden");
    }
  });
  video.addEventListener("ended", () => {
    overlay.classList.remove("hidden");
  });

  window.addEventListener("pagehide", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
