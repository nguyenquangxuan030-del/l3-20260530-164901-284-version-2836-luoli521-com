(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backTop.classList.add('show');
            } else {
                backTop.classList.remove('show');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(target) {
            if (!slides.length) {
                return;
            }

            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === index);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var region = scope.querySelector('[data-filter-region]');
        var category = scope.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function run() {
            var query = valueOf(input);
            var yearValue = valueOf(year);
            var regionValue = valueOf(region);
            var categoryValue = valueOf(category);

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.tags,
                    card.dataset.category
                ].join(' ').toLowerCase();

                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }

                if (yearValue && String(card.dataset.year).toLowerCase() !== yearValue) {
                    ok = false;
                }

                if (regionValue && String(card.dataset.region).toLowerCase() !== regionValue) {
                    ok = false;
                }

                if (categoryValue && String(card.dataset.category).toLowerCase() !== categoryValue) {
                    ok = false;
                }

                card.hidden = !ok;
            });
        }

        [input, year, region, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', run);
                control.addEventListener('change', run);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');

        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-stream');

        function attach() {
            if (video.dataset.ready === '1' || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = stream;
            }

            video.dataset.ready = '1';
        }

        function play() {
            attach();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var action = video.play();

            if (action && action.catch) {
                action.catch(function () {});
            }
        }

        attach();

        if (cover) {
            cover.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    });
})();
