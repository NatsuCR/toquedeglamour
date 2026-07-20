document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.slider-track');

  sliders.forEach((track) => {
    const container = track.closest('.slider-container');
    const wrapper = track.closest('.slider-track-wrapper');
    if (!container || !wrapper) return;

    const btnPrev = container.querySelector('.slider-btn-left');
    const btnNext = container.querySelector('.slider-btn-right');
    if (!btnPrev || !btnNext) return;

    let offset = 0;
    let motionTimer = null;

    const getStep = () => {
      const item = track.querySelector('.slider-item');
      if (!item) return 300;
      const gap = parseInt(window.getComputedStyle(track).gap, 10) || 16;
      return item.getBoundingClientRect().width + gap;
    };

    const getMaxOffset = () => {
      const total = Array.from(track.children).reduce((sum, item) => sum + item.getBoundingClientRect().width, 0);
      const gap = parseInt(window.getComputedStyle(track).gap, 10) || 16;
      const gaps = Math.max(0, track.children.length - 1) * gap;
      const wrapperStyle = window.getComputedStyle(wrapper);
      const padding = parseFloat(wrapperStyle.paddingLeft) + parseFloat(wrapperStyle.paddingRight);
      const visibleWidth = wrapper.clientWidth - padding;
      return Math.max(0, total + gaps - visibleWidth);
    };

    const updateButtons = () => {
      const maxOffset = getMaxOffset();
      btnPrev.disabled = offset <= 0;
      btnNext.disabled = offset >= maxOffset - 1;
    };

    const moveSlider = (direction, button) => {
      const sign = direction === 'next' ? 1 : -1;
      const target = Math.max(0, Math.min(offset + getStep() * sign, getMaxOffset()));
      if (Math.abs(target - offset) < 1) return;

      offset = target;
      button.classList.add('is-active');
      track.dataset.direction = direction;
      track.classList.remove('is-sliding');
      void track.offsetWidth;
      track.classList.add('is-sliding');
      window.clearTimeout(motionTimer);
      window.setTimeout(() => button.classList.remove('is-active'), 220);
      motionTimer = window.setTimeout(() => track.classList.remove('is-sliding'), 700);
      track.style.transform = `translateX(-${offset}px)`;
      updateButtons();
    };

    btnNext.addEventListener('click', () => moveSlider('next', btnNext));
    btnPrev.addEventListener('click', () => moveSlider('prev', btnPrev));

    window.addEventListener('resize', () => {
      offset = Math.min(offset, getMaxOffset());
      track.style.transform = `translateX(-${offset}px)`;
      updateButtons();
    });

    updateButtons();
  });
});
