document.addEventListener('DOMContentLoaded', () => {
  const mobileQuery = window.matchMedia('(max-width: 820px)');

  document.querySelectorAll('.slider-track').forEach((track) => {
    const container = track.closest('.slider-container');
    const wrapper = track.closest('.slider-track-wrapper');
    if (!container || !wrapper) return;

    const prev = container.querySelector('.slider-btn-left');
    const next = container.querySelector('.slider-btn-right');
    let offset = 0;
    let motionTimer = null;

    const getStep = () => {
      const item = track.querySelector('.slider-item');
      if (!item) return wrapper.clientWidth;
      const gap = parseFloat(getComputedStyle(track).gap) || 16;
      return item.getBoundingClientRect().width + gap;
    };

    const getDesktopMax = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const getMobileMax = () => Math.max(0, track.scrollWidth - track.clientWidth);

    const updateButtons = () => {
      if (!prev || !next) return;
      const position = mobileQuery.matches ? track.scrollLeft : offset;
      const max = mobileQuery.matches ? getMobileMax() : getDesktopMax();
      prev.disabled = position <= 1;
      next.disabled = position >= max - 1;
    };

    const startMotion = (direction, button) => {
      button?.classList.add('is-active');
      track.dataset.direction = direction;
      track.classList.remove('is-sliding');
      void track.offsetWidth;
      track.classList.add('is-sliding');
      clearTimeout(motionTimer);
      motionTimer = setTimeout(() => {
        track.classList.remove('is-sliding');
        button?.classList.remove('is-active');
        updateButtons();
      }, 460);
    };

    const move = (direction, button) => {
      const sign = direction === 'next' ? 1 : -1;
      if (mobileQuery.matches) {
        startMotion(direction, button);
        track.scrollBy({ left: getStep() * sign, behavior: 'smooth' });
        return;
      }
      const nextOffset = Math.max(0, Math.min(offset + getStep() * sign, getDesktopMax()));
      if (Math.abs(nextOffset - offset) < 1) return updateButtons();
      offset = nextOffset;
      startMotion(direction, button);
      track.style.transform = `translateX(-${offset}px)`;
      updateButtons();
    };

    next?.addEventListener('click', () => move('next', next));
    prev?.addEventListener('click', () => move('prev', prev));
    track.addEventListener('scroll', updateButtons, { passive: true });

    const syncMode = () => {
      if (mobileQuery.matches) {
        offset = 0;
        track.style.transform = 'none';
      } else {
        track.scrollLeft = 0;
        offset = Math.min(offset, getDesktopMax());
        track.style.transform = `translateX(-${offset}px)`;
      }
      updateButtons();
    };

    window.addEventListener('resize', syncMode);
    new ResizeObserver(syncMode).observe(wrapper);
    syncMode();
  });
});
