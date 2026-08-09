function decodeProductData(button) {
  try {
    if (button.dataset.product) {
      return JSON.parse(decodeURIComponent(button.dataset.product));
    }
  } catch {
    // Continue with the legacy attributes used before version 0.05.
  }
  return {
    id: button.dataset.id,
    nombre: button.dataset.nombre || '',
    marca: button.dataset.marca || '',
    categoriaId: button.dataset.cat || '',
    subcategoriaId: button.dataset.subcat || '',
    tipoVenta: button.dataset.tipo || 'DIRECTA',
    tipoProducto: button.dataset.tipoProducto || 'GENERAL',
    precio: button.dataset.precio || '',
    costo: button.dataset.costo || 0,
    stock: button.dataset.stock || 0,
    pesoGramos: button.dataset.peso || 250,
    esNuevo: button.dataset.nuevo === 'true',
    descripcion: button.dataset.desc || '',
    imagenes: []
  };
}

function renderProductImages(images = []) {
  const shell = document.getElementById('existingProductImages');
  const grid = document.getElementById('existingProductImagesGrid');
  if (!shell || !grid) return;
  grid.replaceChildren();
  shell.hidden = images.length === 0;
  grid.classList.toggle('is-scrollable', images.length > 5);
  images.forEach((image, index) => {
    const card = document.createElement('article');
    card.className = 'product-existing-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'checkbox');
    card.setAttribute('aria-checked', 'false');
    card.setAttribute('aria-label', `Seleccionar imagen ${index + 1} para quitar`);
    const img = document.createElement('img');
    img.src = image.ruta;
    img.alt = `Imagen ${index + 1} del producto`;
    const copy = document.createElement('div');
    copy.className = 'product-image-copy';
    const badge = document.createElement('span');
    badge.className = image.principal ? 'product-image-badge is-main' : 'product-image-badge';
    badge.textContent = image.principal ? 'Principal' : String(index + 1).padStart(2, '0');
    const title = document.createElement('strong');
    title.textContent = `Imagen ${index + 1}`;
    const removeControl = document.createElement('div');
    removeControl.className = 'product-remove-toggle';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'removeImageIds';
    checkbox.value = image.id;
    checkbox.className = 'product-remove-input';
    const check = document.createElement('span');
    check.className = 'product-remove-check';
    const labelText = document.createElement('span');
    labelText.textContent = 'Seleccionar';
    const selectedBadge = document.createElement('span');
    selectedBadge.className = 'product-selected-badge';
    selectedBadge.textContent = 'Se quitara al guardar';
    removeControl.append(checkbox, check, labelText);
    const syncState = () => {
      card.classList.toggle('is-marked', checkbox.checked);
      card.setAttribute('aria-checked', String(checkbox.checked));
      labelText.textContent = checkbox.checked ? 'Seleccionada' : 'Seleccionar';
    };
    const toggleCard = () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    };
    checkbox.addEventListener('change', syncState);
    card.addEventListener('click', toggleCard);
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleCard();
    });
    copy.append(title, removeControl);
    card.append(img, badge, selectedBadge, copy);
    grid.append(card);
  });
}

function clearProductImages() {
  renderProductImages([]);
  window.clearNewProductImageSelection?.();
}
