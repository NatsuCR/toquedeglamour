function decodeProductData(button) {
  try {
    return JSON.parse(decodeURIComponent(button.dataset.product || ''));
  } catch {
    return null;
  }
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
    const title = document.createElement('strong');
    title.textContent = image.principal ? `Imagen ${index + 1} - Principal` : `Imagen ${index + 1}`;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'removeImageIds';
    checkbox.value = image.id;
    label.append(checkbox, document.createTextNode(' Quitar'));
    copy.append(title, label);
    card.append(img, copy);
    grid.append(card);
  });
}

function clearProductImages() {
  renderProductImages([]);
  const preview = document.getElementById('newProductImagesPreview');
  if (preview) preview.replaceChildren();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('imgInput')?.addEventListener('change', (event) => {
    const preview = document.getElementById('newProductImagesPreview');
    if (!preview) return;
    preview.replaceChildren();
    Array.from(event.target.files || []).forEach((file, index) => {
      const item = document.createElement('span');
      item.textContent = `Nueva ${index + 1}: ${file.name}`;
      preview.append(item);
    });
  });
});
