
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function norm(v) { return (v || "").toString().toLowerCase().trim(); }

  function toggleNav() {
    const btn = $(".menu-btn");
    const nav = $(".nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  function bindBackToTop() {
    const btn = $(".back-top");
    if (!btn) return;
    const onScroll = () => {
      btn.style.display = window.scrollY > 700 ? "inline-flex" : "none";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function applyFilters(form) {
    const cards = $all("[data-filter-card]", form.closest("main") || document);
    if (!cards.length) return;
    const q = $('input[name="q"]', form);
    const type = $('select[name="type"]', form);
    const region = $('select[name="region"]', form);
    const year = $('select[name="year"]', form);
    const count = $('[data-visible-count]', form);
    const update = () => {
      const qv = norm(q && q.value);
      const tv = norm(type && type.value);
      const rv = norm(region && region.value);
      const yv = norm(year && year.value);
      let visible = 0;
      cards.forEach((card) => {
        const hay = [
          card.dataset.title,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.tags
        ].map(norm).join(" ");
        const ok = (!qv || hay.includes(qv)) &&
          (!tv || norm(card.dataset.type) === tv) &&
          (!rv || norm(card.dataset.region) === rv) &&
          (!yv || norm(card.dataset.year) === yv);
        card.classList.toggle("hide", !ok);
        if (ok) visible += 1;
      });
      if (count) count.textContent = visible;
    };
    [q, type, region, year].forEach((el) => {
      if (el) {
        el.addEventListener("input", update);
        el.addEventListener("change", update);
      }
    });
    update();
  }

  function initFilters() {
    $all("[data-filter-form]").forEach(applyFilters);
  }

  function initPlayer() {
    const HlsCtor = window.Hls;
    $all("video[data-hls-src]").forEach((video) => {
      const hlsSrc = video.dataset.hlsSrc;
      const mp4Src = video.dataset.mp4Src;
      if (!hlsSrc) return;

      const nativeSupport = video.canPlayType("application/vnd.apple.mpegurl");
      if (nativeSupport) {
        video.src = hlsSrc;
        return;
      }
      if (HlsCtor && HlsCtor.isSupported()) {
        try {
          const hls = new HlsCtor({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 30
          });
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          video._hls = hls;
          hls.on(HlsCtor.Events.ERROR, function (event, data) {
            if (data && data.fatal && mp4Src) {
              try { hls.destroy(); } catch (e) {}
              video.src = mp4Src;
            }
          });
        } catch (err) {
          if (mp4Src) video.src = mp4Src;
        }
        return;
      }
      if (mp4Src) video.src = mp4Src;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    toggleNav();
    bindBackToTop();
    initFilters();
    initPlayer();
  });
})();
