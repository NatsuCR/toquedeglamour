const PRODUCT_FAQ_LIMIT = 4;

function productFaqElements() {
  const section = document.querySelector('[data-product-create-faqs]');
  return {
    section,
    list: section?.querySelector('[data-faq-list]'),
    template: section?.querySelector('[data-faq-template]'),
    add: section?.querySelector('[data-add-faq]'),
    count: section?.querySelector('[data-faq-count]')
  };
}

function updateProductFaqs() {
  const elements = productFaqElements();
  const items = Array.from(elements.list?.children || []);
  items.forEach((item, index) => {
    item.querySelector('[data-faq-title]').textContent = `Pregunta frecuente ${index + 1}`;
  });
  if (elements.count) elements.count.textContent = String(items.length);
  if (elements.add) {
    elements.add.disabled = items.length >= PRODUCT_FAQ_LIMIT;
    elements.add.textContent = items.length >= PRODUCT_FAQ_LIMIT
      ? 'Máximo de 4 preguntas alcanzado'
      : '+ Agregar otra pregunta';
  }
}

function addProductFaq(faq = {}) {
  const elements = productFaqElements();
  if (!elements.list || elements.list.children.length >= PRODUCT_FAQ_LIMIT) return;
  const fragment = elements.template.content.cloneNode(true);
  fragment.querySelector('[data-faq-id]').value = faq.id || '';
  fragment.querySelector('[name="faqPregunta[]"]').value = faq.pregunta || '';
  fragment.querySelector('[name="faqRespuesta[]"]').value = faq.respuesta || '';
  elements.list.appendChild(fragment);
  updateProductFaqs();
}

function clearProductFaqs() {
  const { list } = productFaqElements();
  if (list) list.replaceChildren();
}

window.prepareProductFaqsForCreate = () => {
  const { section } = productFaqElements();
  if (!section) return;
  section.hidden = false;
  clearProductFaqs();
  addProductFaq();
};

window.prepareProductFaqsForEdit = (faqs = []) => {
  const { section } = productFaqElements();
  if (!section) return;
  section.hidden = false;
  clearProductFaqs();
  if (faqs.length) faqs.slice(0, PRODUCT_FAQ_LIMIT).forEach(addProductFaq);
  else addProductFaq();
};

document.addEventListener('DOMContentLoaded', () => {
  const { section, add } = productFaqElements();
  add?.addEventListener('click', addProductFaq);
  section?.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-faq]');
    if (!remove) return;
    remove.closest('.product-create-faq-item')?.remove();
    if (!productFaqElements().list.children.length) addProductFaq();
    updateProductFaqs();
  });
});
