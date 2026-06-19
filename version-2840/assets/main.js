(function () {
  const toggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.hidden = !mobileMenu.hidden;
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  let current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const searchInput = document.getElementById('siteSearch');
  const searchPanel = document.getElementById('searchPanel');

  function renderSearch(query) {
    if (!searchInput || !searchPanel || !Array.isArray(window.movieSearchData)) {
      return;
    }

    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      searchPanel.hidden = true;
      searchPanel.innerHTML = '';
      return;
    }

    const result = window.movieSearchData
      .filter(function (item) {
        return item.title.toLowerCase().includes(keyword) ||
          item.genre.toLowerCase().includes(keyword) ||
          item.year.includes(keyword);
      })
      .slice(0, 12);

    if (!result.length) {
      searchPanel.hidden = false;
      searchPanel.innerHTML = '<div class="empty-search">暂无匹配影片</div>';
      return;
    }

    searchPanel.hidden = false;
    searchPanel.innerHTML = result.map(function (item) {
      return '<a href="./' + item.file + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.genre + ' · ' + item.year + '</span></span>' +
        '</a>';
    }).join('');
  }

  if (searchInput && searchPanel) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });

    document.addEventListener('click', function (event) {
      if (!searchPanel.contains(event.target) && event.target !== searchInput) {
        searchPanel.hidden = true;
      }
    });
  }

  const localFilter = document.getElementById('localFilter');
  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    localFilter.addEventListener('input', function () {
      const keyword = localFilter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const hay = [card.dataset.title, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
        card.style.display = hay.includes(keyword) ? '' : 'none';
      });
    });
  }
})();
