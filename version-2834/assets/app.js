(function () {
    var header = document.querySelector('[data-header]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    var menuToggle = document.querySelector('[data-menu-toggle]');

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });

    if (menuToggle && mobileNav && header) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
            header.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        startHero();
    }

    function normalize(text) {
        return (text || '').toString().toLowerCase().trim();
    }

    var filterInput = document.querySelector('[data-movie-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeChip = '全部';

    function matchChip(card, chip) {
        if (!chip || chip === '全部') {
            return true;
        }
        var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-meta'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
        ].join(' ');
        return normalize(haystack).indexOf(normalize(chip)) !== -1;
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = filterInput ? normalize(filterInput.value) : '';
        var shown = 0;
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-meta'),
                card.textContent
            ].join(' '));
            var visible = haystack.indexOf(query) !== -1 && matchChip(card, activeChip);
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
        filterInput.addEventListener('input', applyFilters);
    }

    document.querySelectorAll('[data-filter-chips]').forEach(function (group) {
        group.addEventListener('click', function (event) {
            var button = event.target.closest('[data-filter]');
            if (!button) {
                return;
            }
            group.querySelectorAll('[data-filter]').forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            activeChip = button.getAttribute('data-filter') || '全部';
            applyFilters();
        });
    });

    applyFilters();

    function initPlayer(video, overlay) {
        if (!video || video.dataset.ready === '1') {
            return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = source;
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    document.querySelectorAll('[data-video-player]').forEach(function (video) {
        var box = video.closest('.player-box');
        var overlay = box ? box.querySelector('[data-player-overlay]') : null;
        if (overlay) {
            overlay.addEventListener('click', function () {
                initPlayer(video, overlay);
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                initPlayer(video, overlay);
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    });
}());
