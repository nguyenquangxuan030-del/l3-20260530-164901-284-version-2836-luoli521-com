function initMoviePlayer(videoSource) {
  const video = document.getElementById('moviePlayer');
  const overlay = document.getElementById('playerOverlay');
  const button = document.getElementById('playButton');
  let loaded = false;

  function loadVideo() {
    if (!video || !videoSource || loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSource);
      hls.attachMedia(video);
    } else {
      video.src = videoSource;
    }
  }

  function startPlay() {
    loadVideo();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlay);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlay();
    });
  }

  if (video) {
    video.addEventListener('click', startPlay);
  }
}
