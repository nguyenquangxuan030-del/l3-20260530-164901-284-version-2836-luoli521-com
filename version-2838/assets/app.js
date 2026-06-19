(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }
  }

  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function initMenu() {
    const btn = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector(".site-nav");
    if (!btn || !nav) return;

    btn.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      nav.classList.remove("is-open");
    });
  }

  function applyFilter(input, scope) {
    const query = normalize(input.value);
    const cards = scope.querySelectorAll("[data-filter-card]");
    const terms = query ? query.split(/\s+/).filter(Boolean) : [];

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute("data-search") || card.textContent);
      const match = !terms.length || terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
      card.classList.toggle("hidden", !match);
    });

    const emptyState = scope.querySelector("[data-filter-empty]");
    if (emptyState) {
      const visible = Array.from(cards).some(function (card) {
        return !card.classList.contains("hidden");
      });
      emptyState.classList.toggle("hidden", visible);
    }
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      const scopeSelector = input.getAttribute("data-filter-target");
      const scope = scopeSelector ? document.querySelector(scopeSelector) : input.closest("[data-filter-scope]") || input.closest("[data-filter-wrap]") || document;
      if (!scope) return;

      input.addEventListener("input", function () {
        applyFilter(input, scope);
      });

      applyFilter(input, scope);
    });
  }

  function once(target, eventName) {
    return new Promise(function (resolve) {
      target.addEventListener(eventName, function handler(event) {
        target.removeEventListener(eventName, handler);
        resolve(event);
      }, { once: true });
    });
  }

  async function loadHlsIntoVideo(video, hlsUrl, codec, fallbackUrl) {
    if (!("MediaSource" in window)) {
      video.src = fallbackUrl;
      return false;
    }

    const mime = 'video/mp4; codecs="' + codec + '"';
    if (!window.MediaSource.isTypeSupported(mime)) {
      video.src = fallbackUrl;
      return false;
    }

    try {
      const manifestResponse = await fetch(hlsUrl, { cache: "no-store" });
      if (!manifestResponse.ok) throw new Error("Manifest load failed");
      const manifestText = await manifestResponse.text();
      const baseUrl = new URL(hlsUrl, window.location.href);
      const lines = manifestText.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);

      let initUri = "";
      const segments = [];
      lines.forEach(function (line) {
        if (line.indexOf("#EXT-X-MAP:") === 0) {
          const match = line.match(/URI="([^"]+)"/);
          if (match) initUri = match[1];
        } else if (line[0] !== "#") {
          segments.push(line);
        }
      });

      if (!initUri || !segments.length) throw new Error("Invalid HLS manifest");

      const resolveUrl = function (uri) {
        return new URL(uri, baseUrl).href;
      };

      const mediaSource = new MediaSource();
      const objectUrl = URL.createObjectURL(mediaSource);
      video.src = objectUrl;

      await once(mediaSource, "sourceopen");
      const sourceBuffer = mediaSource.addSourceBuffer(mime);

      function appendBuffer(data) {
        return new Promise(function (resolve, reject) {
          const onUpdate = function () {
            cleanup();
            resolve();
          };
          const onError = function (event) {
            cleanup();
            reject(event);
          };
          const cleanup = function () {
            sourceBuffer.removeEventListener("updateend", onUpdate);
            sourceBuffer.removeEventListener("error", onError);
          };
          sourceBuffer.addEventListener("updateend", onUpdate);
          sourceBuffer.addEventListener("error", onError);
          sourceBuffer.appendBuffer(data);
        });
      }

      const initBuffer = await (await fetch(resolveUrl(initUri), { cache: "no-store" })).arrayBuffer();
      await appendBuffer(initBuffer);

      for (const segment of segments) {
        const data = await (await fetch(resolveUrl(segment), { cache: "no-store" })).arrayBuffer();
        await appendBuffer(data);
      }

      if (mediaSource.readyState === "open") {
        mediaSource.endOfStream();
      }

      await video.play();
      return true;
    } catch (error) {
      console.warn("HLS fallback", error);
      video.src = fallbackUrl;
      try {
        await video.play();
      } catch (e) {}
      return false;
    }
  }

  function initPlayers() {
    document.querySelectorAll("[data-hls-player]").forEach(function (wrap) {
      const video = wrap.querySelector("video");
      const overlay = wrap.querySelector("[data-play-overlay]");
      const hlsUrl = wrap.getAttribute("data-hls-src");
      const fallbackUrl = wrap.getAttribute("data-fallback-src");
      const codec = wrap.getAttribute("data-codec") || "avc1.42E01E";
      if (!video || !overlay) return;

      let started = false;

      async function startPlayback() {
        if (started) {
          try {
            await video.play();
          } catch (e) {}
          return;
        }
        started = true;
        overlay.classList.add("hidden");
        await loadHlsIntoVideo(video, hlsUrl, codec, fallbackUrl);
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initFilters();
    initPlayers();
  });
})();
