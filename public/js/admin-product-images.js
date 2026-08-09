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
  images.forEach((image, index) => {
    const card = document.createElement('article');
    card.className = 'product-existing-card';
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
    const label = document.createElement('label');
    label.className = 'product-remove-toggle';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'removeImageIds';
    checkbox.value = image.id;
    const check = document.createElement('span');
    check.className = 'product-remove-check';
    const labelText = document.createElement('span');
    labelText.textContent = 'Quitar';
    label.append(checkbox, check, labelText);
    checkbox.addEventListener('change', () => {
      card.classList.toggle('is-marked', checkbox.checked);
      labelText.textContent = checkbox.checked ? 'Marcada para quitar' : 'Quitar';
    });
    copy.append(title, label);
    card.append(img, badge, copy);
    grid.append(card);
  });
}

function clearProductImages() {
  renderProductImages([]);
  const preview = document.getElementById('newProductImagesPreview');
  if (preview) preview.replaceChildren();
  updateImageSelectionStatus(0);
}

let productPreviewUrls = [];

function updateImageSelectionStatus(count) {
  const status = document.getElementById('productImageSelectionStatus');
  if (!status) return;
  status.textContent = count === 1
    ? '1 imagen lista para agregar'
    : count > 1 ? `${count} imágenes listas para agregar` : '';
}

function renderNewImagePreviews(files) {
  const preview = document.getElementById('newProductImagesPreview');
  if (!preview) return;
  productPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  productPreviewUrls = [];
  preview.replaceChildren();
  files.forEach((file, index) => {
    const item = document.createElement('article');
    item.className = 'product-new-image-card';
    const image = document.createElement('img');
    const url = URL.createObjectURL(file);
    productPreviewUrls.push(url);
    image.src = url;
    image.alt = `Vista previa de ${file.name}`;
    const badge = document.createElement('strong');
    badge.textContent = index === 0 ? 'Primera nueva' : `Nueva ${index + 1}`;
    const copy = document.createElement('span');
    copy.textContent = file.name;
    item.append(image, badge, copy);
    preview.append(item);
  });
  updateImageSelectionStatus(files.length);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('imgInput')?.addEventListener('change', (event) => {
    renderNewImagePreviews(Array.from(event.target.files || []));
  });
});
