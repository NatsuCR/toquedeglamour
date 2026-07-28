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
