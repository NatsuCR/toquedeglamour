function productFormError(message, field) {
  const alert = document.querySelector('[data-product-form-error]');
  if (!alert) return;
  alert.textContent = message;
  alert.hidden = false;
  field?.focus();
  alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.resetProductSubmitState = () => {
  const alert = document.querySelector('[data-product-form-error]');
  const button = document.querySelector('[data-product-submit]');
  if (alert) {
    alert.hidden = true;
    alert.textContent = '';
  }
  if (button) {
    button.disabled = false;
    button.textContent = 'Guardar producto';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formPrincipal');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    window.resetProductSubmitState();
    for (const item of form.querySelectorAll('.product-create-faq-item')) {
      const question = item.querySelector('[name="faqPregunta[]"]');
      const answer = item.querySelector('[name="faqRespuesta[]"]');
      const questionValue = question.value.trim();
      const answerValue = answer.value.trim();
      if (!questionValue && !answerValue) continue;
      if (questionValue.length < 5 || answerValue.length < 5) {
        event.preventDefault();
        productFormError(
          'Cada pregunta y respuesta debe tener al menos 5 caracteres.',
          questionValue.length < 5 ? question : answer
        );
        return;
      }
    }
    const button = form.querySelector('[data-product-submit]');
    button.disabled = true;
    button.textContent = 'Guardando producto…';
  });
});
