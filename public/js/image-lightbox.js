document.addEventListener('DOMContentLoaded', () => {
  let overlay, image, canvas;
  let gallery = [], index = 0, scale = 1, x = 0, y = 0;
  let lastPoint = null, pinchDistance = 0;
  const pointers = new Map();
  const applyTransform = () => {
    image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    overlay.querySelector('[data-zoom-value]').textContent = `${Math.round(scale * 100)}%`;
    canvas.classList.toggle('is-zoomed', scale > 1);
  };
  const setZoom = (value) => {
    scale = Math.min(5, Math.max(1, value));
    if (scale === 1) x = y = 0;
    applyTransform();
  };
  const resetZoom = () => { scale = 1; x = y = 0; applyTransform(); };
  function ensureLightbox() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'image-lightbox';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="image-lightbox-frame" role="dialog" aria-modal="true" aria-label="Visor de imagen">
        <button class="image-lightbox-close" type="button" aria-label="Cerrar">×</button>
        <button class="image-lightbox-arrow is-prev" type="button" aria-label="Anterior">‹</button>
        <div class="image-lightbox-canvas"><img alt="" draggable="false"></div>
        <button class="image-lightbox-arrow is-next" type="button" aria-label="Siguiente">›</button>
        <div class="image-lightbox-tools" aria-label="Controles de zoom">
          <button type="button" data-zoom-out aria-label="Alejar">−</button>
          <button type="button" data-zoom-reset><span data-zoom-value>100%</span></button>
          <button type="button" data-zoom-in aria-label="Acercar">+</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    image = overlay.querySelector('img');
    canvas = overlay.querySelector('.image-lightbox-canvas');
    overlay.querySelector('.image-lightbox-close').onclick = close;
    overlay.querySelector('.is-prev').onclick = () => show(index - 1);
    overlay.querySelector('.is-next').onclick = () => show(index + 1);
    overlay.querySelector('[data-zoom-in]').onclick = () => setZoom(scale + 0.5);
    overlay.querySelector('[data-zoom-out]').onclick = () => setZoom(scale - 0.5);
    overlay.querySelector('[data-zoom-reset]').onclick = resetZoom;
    overlay.onclick = (event) => { if (event.target === overlay) close(); };
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault(); setZoom(scale + (event.deltaY < 0 ? 0.25 : -0.25));
    }, { passive: false });
    canvas.ondblclick = () => setZoom(scale > 1 ? 1 : 2);
    bindPointers();
  }
  function bindPointers() {
    canvas.onpointerdown = (event) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      canvas.setPointerCapture(event.pointerId);
      lastPoint = { x: event.clientX, y: event.clientY };
    };
    canvas.onpointermove = (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const points = [...pointers.values()];
      if (points.length > 1) {
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        if (pinchDistance) setZoom(scale * distance / pinchDistance);
        pinchDistance = distance;
      } else if (scale > 1 && lastPoint) {
        x += event.clientX - lastPoint.x; y += event.clientY - lastPoint.y; applyTransform();
      }
      lastPoint = { x: event.clientX, y: event.clientY };
    };
    const release = (event) => { pointers.delete(event.pointerId); pinchDistance = 0; lastPoint = null; };
    canvas.onpointerup = release;
    canvas.onpointercancel = release;
  }
  function show(nextIndex) {
    if (nextIndex < 0 || nextIndex >= gallery.length) return;
    index = nextIndex; image.src = gallery[index].src; image.alt = gallery[index].alt; resetZoom();
    overlay.querySelector('.is-prev').disabled = index === 0;
    overlay.querySelector('.is-next').disabled = index === gallery.length - 1;
  }
  function open(src, alt, trigger) {
    ensureLightbox();
    const thumbs = trigger?.matches('[data-product-main]') ? [...document.querySelectorAll('[data-product-thumb]')] : [];
    gallery = thumbs.map((thumb, item) => ({ src: thumb.dataset.productThumb, alt: `${alt} ${item + 1}` }));
    if (!gallery.length) gallery = [{ src, alt }];
    overlay.hidden = false; document.body.classList.add('image-lightbox-open');
    show(Math.max(0, gallery.findIndex((item) => item.src === src)));
  }
  function close() { overlay.hidden = true; image.removeAttribute('src'); document.body.classList.remove('image-lightbox-open'); }
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox-src]');
    if (!trigger) return; event.preventDefault(); open(trigger.dataset.lightboxSrc, trigger.dataset.lightboxAlt || 'Imagen ampliada', trigger);
  });
  document.addEventListener('keydown', (event) => {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === '+') setZoom(scale + 0.5);
    if (event.key === '-') setZoom(scale - 0.5);
  });
});
