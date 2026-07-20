(function () {
  const shell = document.querySelector('[data-support-chat]');
  if (!shell) return;

  const thread = shell.querySelector('[data-support-thread]');
  const form = shell.querySelector('[data-support-form]');
  const errorBox = shell.querySelector('[data-support-error]');
  const statusNode = shell.querySelector('[data-support-status]');
  const closedNode = shell.querySelector('[data-support-closed]');
  const closeForm = shell.querySelector('[data-support-close-form]');
  const ownAuthor = shell.dataset.ownAuthor;
  const apiUrl = shell.dataset.api;

  function text(tag, value, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value || '';
    return node;
  }

  function formatDate(value) {
    return new Date(value).toLocaleString('es-CR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  function fileNode(file) {
    const wrap = document.createElement('div');
    wrap.className = 'support-file-item';
    if (file.esImagen) {
      const img = document.createElement('img');
      img.src = file.url;
      img.alt = file.nombre;
      wrap.appendChild(img);
    }
    const link = document.createElement('a');
    link.href = file.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = file.nombre;
    wrap.appendChild(link);
    return wrap;
  }

  function renderMessage(message) {
    const isAdminView = ownAuthor === 'ADMIN';
    const node = document.createElement('div');
    node.className = isAdminView ? 'admin-chat-message' : 'chat-message';
    if (message.autor === ownAuthor) node.classList.add(isAdminView ? 'admin' : 'mine');
    if (!isAdminView && message.autor === 'ADMIN') node.classList.add('admin');
    node.appendChild(text('strong', message.autor === 'ADMIN' ? 'Administracion' : 'Cliente'));
    node.appendChild(text('p', message.mensaje));
    if (message.adjuntos.length) {
      const files = document.createElement('div');
      files.className = 'support-files';
      message.adjuntos.forEach((file) => files.appendChild(fileNode(file)));
      node.appendChild(files);
    }
    node.appendChild(text('small', formatDate(message.creadoEn)));
    return node;
  }

  function render(ticket) {
    if (statusNode) statusNode.textContent = ticket.estado;
    thread.replaceChildren(...ticket.mensajes.map(renderMessage));
    thread.scrollTop = thread.scrollHeight;
    const closed = ticket.estado === 'CERRADO';
    if (form) form.hidden = closed;
    if (closeForm) closeForm.hidden = closed;
    if (closedNode) closedNode.hidden = !closed;
  }

  async function refresh() {
    try {
      const response = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
      render(await response.json());
    } catch (error) {
      console.warn('No se pudo actualizar el ticket:', error.message);
    }
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.hidden = !message;
    errorBox.textContent = message || '';
  }

  async function submitReply(event) {
    event.preventDefault();
    showError('');
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo enviar.');
      form.reset();
      render(data);
    } catch (error) {
      showError(error.message);
    } finally {
      if (button) button.disabled = false;
    }
  }

  if (form) form.addEventListener('submit', submitReply);
  refresh();
  setInterval(refresh, 5000);
})();
