document.addEventListener('click', (event) => {
  const target = event.target.closest('a, button');
  if (!target || target.matches('[data-no-track]')) return;

  const label = (
    target.getAttribute('aria-label') ||
    target.textContent ||
    target.getAttribute('title') ||
    target.tagName
  ).replace(/\s+/g, ' ').trim().slice(0, 160);

  let destination = target.getAttribute('href') || '';
  if (destination.startsWith(window.location.origin)) {
    destination = destination.slice(window.location.origin.length);
  }

  const payload = JSON.stringify({
    ruta: `${window.location.pathname}${window.location.search}`,
    destino: destination.slice(0, 255),
    etiqueta: label
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      '/analitica/evento',
      new Blob([payload], { type: 'application/json' })
    );
    return;
  }

  fetch('/analitica/evento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {});
});
