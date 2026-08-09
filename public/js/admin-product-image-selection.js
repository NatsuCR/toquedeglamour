let selectedProductImages = [];
let selectedProductImageUrls = [];

function syncProductImageInput() {
  const input = document.getElementById('imgInput');
  if (!input) return;
  const transfer = new DataTransfer();
  selectedProductImages.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}

function updateProductImageStatus() {
  const status = document.getElementById('productImageSelectionStatus');
  const clear = document.getElementById('clearProductImageSelection');
  const count = selectedProductImages.length;
  if (status) {
    status.textContent = count === 1
      ? '1 imagen lista para agregar'
      : count > 1 ? `${count} imágenes listas para agregar` : '';
  }
  if (clear) clear.hidden = count === 0;
}

function removeSelectedProductImage(index) {
  selectedProductImages.splice(index, 1);
  syncProductImageInput();
  renderSelectedProductImages();
}

function createSelectedImageCard(file, index) {
  const card = document.createElement('article');
  card.className = 'product-new-image-card';
  const image = document.createElement('img');
  const url = URL.createObjectURL(file);
  selectedProductImageUrls.push(url);
  image.src = url;
  image.alt = `Vista previa de ${file.name}`;
  const badge = document.createElement('strong');
  badge.textContent = index === 0 ? 'Primera nueva' : `Nueva ${index + 1}`;
  const name = document.createElement('span');
  name.textContent = file.name;
  const remove = document.createElement('button');
  remove.className = 'product-new-image-remove';
  remove.type = 'button';
  remove.title = `Quitar ${file.name}`;
  remove.setAttribute('aria-label', `Quitar ${file.name}`);
  remove.textContent = '×';
  remove.addEventListener('click', () => removeSelectedProductImage(index));
  card.append(image, badge, name, remove);
  return card;
}

function renderSelectedProductImages() {
  const preview = document.getElementById('newProductImagesPreview');
  if (!preview) return;
  selectedProductImageUrls.forEach((url) => URL.revokeObjectURL(url));
  selectedProductImageUrls = [];
  preview.replaceChildren();
  selectedProductImages.forEach((file, index) => {
    preview.append(createSelectedImageCard(file, index));
  });
  updateProductImageStatus();
}

window.clearNewProductImageSelection = function clearSelection() {
  selectedProductImages = [];
  syncProductImageInput();
  renderSelectedProductImages();
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('imgInput')?.addEventListener('change', (event) => {
    selectedProductImages = Array.from(event.target.files || []);
    renderSelectedProductImages();
  });
  document.getElementById('clearProductImageSelection')
    ?.addEventListener('click', window.clearNewProductImageSelection);
});
