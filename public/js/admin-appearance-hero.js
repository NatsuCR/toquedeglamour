document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('heroImagesInput');
  const container = document.getElementById('newHeroSlideFields');
  if (!input || !container) return;

  function field(label, name, value, textarea = false) {
    const wrapper = document.createElement('label');
    wrapper.textContent = label;
    const control = document.createElement(textarea ? 'textarea' : 'input');
    control.name = name;
    control.value = value;
    if (textarea) control.rows = 3;
    if (name === 'newHeroTitle') control.required = true;
    wrapper.appendChild(control);
    return wrapper;
  }

  input.addEventListener('change', () => {
    container.replaceChildren();
    [...input.files].forEach((file, index) => {
      const card = document.createElement('section');
      card.className = 'new-hero-slide-card';
      const title = document.createElement('strong');
      title.textContent = `Nueva portada ${index + 1}: ${file.name}`;
      card.append(
        title,
        field('Texto superior', 'newHeroEyebrow', 'Belleza, salud y cuidado personal'),
        field('Titulo principal', 'newHeroTitle', 'Tu belleza, tu toque de glamour'),
        field(
          'Descripcion',
          'newHeroText',
          'Productos seleccionados para tu rutina diaria y compras faciles desde casa.',
          true
        )
      );
      container.appendChild(card);
    });
  });
});

let activeHeroCard = null;
let heroPreviewUrl = null;
let previousReplacementFile = null;
let pendingReplacement = false;

function closeHeroEditor(discard = true) {
  if (discard && pendingReplacement && activeHeroCard) {
    const input = replacementInput();
    const transfer = new DataTransfer();
    if (previousReplacementFile) transfer.items.add(previousReplacementFile);
    input.files = transfer.files;
    activeHeroCard.querySelector('[name="heroReplacementIndexes"]').disabled = !previousReplacementFile;
  }
  document.getElementById('heroEditModal')?.close();
  activeHeroCard = null;
  pendingReplacement = false;
}

function replacementInput() {
  return activeHeroCard?.querySelector('[data-hero-replacement]');
}

function showReplacement(file) {
  if (heroPreviewUrl) URL.revokeObjectURL(heroPreviewUrl);
  heroPreviewUrl = URL.createObjectURL(file);
  document.getElementById('heroEditPreview').src = heroPreviewUrl;
  document.getElementById('heroReplacementName').textContent = `Nueva imagen: ${file.name}`;
  pendingReplacement = true;
}

document.addEventListener('click', (event) => {
  const edit = event.target.closest('[data-edit-hero]');
  if (edit) {
    activeHeroCard = document.querySelector(`[data-hero-card="${edit.dataset.editHero}"]`);
    const modal = document.getElementById('heroEditModal');
    if (!activeHeroCard || !modal) return;
    document.getElementById('heroEditPreview').src = activeHeroCard.querySelector('img').src;
    document.getElementById('heroEditEyebrow').value = activeHeroCard.querySelector('[name="heroSlideEyebrow"]').value;
    document.getElementById('heroEditTitle').value = activeHeroCard.querySelector('[name="heroSlideTitle"]').value;
    document.getElementById('heroEditText').value = activeHeroCard.querySelector('[name="heroSlideText"]').value;
    const selectedFile = replacementInput()?.files[0];
    previousReplacementFile = selectedFile || null;
    pendingReplacement = false;
    document.getElementById('heroReplacementName').textContent = selectedFile
      ? `Nueva imagen: ${selectedFile.name}` : 'La imagen actual se conserva.';
    modal.showModal();
    document.getElementById('heroEditTitle').focus();
  }
  if (event.target.closest('[data-replace-hero]')) replacementInput()?.click();
  if (event.target.closest('[data-close-hero]')) closeHeroEditor();
  if (event.target.closest('[data-save-hero]') && activeHeroCard) {
    const eyebrow = document.getElementById('heroEditEyebrow').value.trim();
    const title = document.getElementById('heroEditTitle').value.trim();
    const copy = document.getElementById('heroEditText').value.trim();
    if (!title) return document.getElementById('heroEditTitle').reportValidity();
    activeHeroCard.querySelector('[name="heroSlideEyebrow"]').value = eyebrow;
    activeHeroCard.querySelector('[name="heroSlideTitle"]').value = title;
    activeHeroCard.querySelector('[name="heroSlideText"]').value = copy;
    activeHeroCard.querySelector('[data-hero-eyebrow-summary]').textContent = eyebrow;
    activeHeroCard.querySelector('[data-hero-title-summary]').textContent = title;
    activeHeroCard.querySelector('[data-hero-text-summary]').textContent = copy;
    if (pendingReplacement) {
      activeHeroCard.querySelector('[name="heroReplacementIndexes"]').disabled = false;
      activeHeroCard.querySelector('.hero-slide-media img').src = heroPreviewUrl;
    }
    closeHeroEditor(false);
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('[data-hero-replacement]') && event.target.files[0]) {
    activeHeroCard = event.target.closest('[data-hero-card]');
    showReplacement(event.target.files[0]);
  }
});
