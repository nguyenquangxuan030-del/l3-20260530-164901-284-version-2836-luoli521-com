(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function byParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function norm(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupImageFallbacks() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        var parent = img.closest('.cover-box, .poster-link, .rank-cover');
        if (parent) {
          parent.classList.add('cover-fallback');
        }
      }, { once: true });
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var cover = qs('[data-play-cover]', player);
      var errorBox = qs('[data-player-error]', player);
      var source = player.getAttribute('data-video-url');
      var attached = false;
      var hls = null;
      if (!video || !source) {
        return;
      }
      function attach(start) {
        if (!attached) {
          attached = true;
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hls.recoverMediaError();
                } else {
                  hls.destroy();
                }
              }
            });
          } else {
            video.src = source;
          }
        }
        if (start) {
          video.play().catch(function () {
            if (errorBox) {
              errorBox.textContent = '播放遇到问题，请稍后重试。';
            }
          });
        }
      }
      if (cover) {
        cover.addEventListener('click', function () {
          cover.classList.add('is-hidden');
          attach(true);
        });
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          if (cover) {
            cover.classList.add('is-hidden');
          }
          attach(true);
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = movie.tags.slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" data-title="' + escapeHtml(movie.title) + '" href="' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-top"><span>' + escapeHtml(movie.category) + '</span>' + tags + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var container = qs('[data-search-results]');
    if (!container || !window.MOVIE_INDEX) {
      return;
    }
    var state = qs('[data-result-state]');
    var form = qs('[data-filter-form]');
    var input = qs('[data-filter-keyword]');
    var category = qs('[data-filter-category]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');
    var initialQ = byParam('q');
    var initialCategory = byParam('category');
    if (input) {
      input.value = initialQ;
    }
    if (category && initialCategory) {
      category.value = initialCategory;
    }
    function render() {
      var keyword = norm(input && input.value);
      var cat = category ? category.value : '';
      var tp = type ? type.value : '';
      var yr = year ? year.value : '';
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var content = norm([movie.title, movie.oneLine, movie.genre, movie.region, movie.type, movie.tags.join(' ')].join(' '));
        return (!keyword || content.indexOf(keyword) !== -1) &&
          (!cat || movie.category === cat) &&
          (!tp || movie.type.indexOf(tp) !== -1) &&
          (!yr || String(movie.year) === String(yr));
      });
      container.innerHTML = list.slice(0, 180).map(movieCard).join('');
      if (state) {
        state.textContent = list.length ? '已匹配到相关影片，继续调整关键词可缩小范围。' : '没有匹配到相关影片。';
      }
      setupImageFallbacks();
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
      qsa('input, select', form).forEach(function (el) {
        el.addEventListener('input', render);
        el.addEventListener('change', render);
      });
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupImageFallbacks();
    setupHero();
    setupPlayers();
    setupSearchPage();
  });
})();
