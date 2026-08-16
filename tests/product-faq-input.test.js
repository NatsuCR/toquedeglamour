import test from 'node:test';
import assert from 'node:assert/strict';
import {
  productFaqCreateInput,
  productFaqEntries
} from '../src/services/product-faq-input.service.js';

test('permite omitir las preguntas al crear un producto', () => {
  assert.equal(productFaqCreateInput({}), undefined);
  assert.equal(productFaqCreateInput({ faqPregunta: '', faqRespuesta: '' }), undefined);
});

test('prepara hasta cuatro preguntas para crearlas junto al producto', () => {
  const questions = ['Pregunta uno', 'Pregunta dos', 'Pregunta tres', 'Pregunta cuatro'];
  const answers = ['Respuesta uno', 'Respuesta dos', 'Respuesta tres', 'Respuesta cuatro'];
  assert.deepEqual(productFaqCreateInput({ faqPregunta: questions, faqRespuesta: answers }), {
    create: questions.map((pregunta, index) => ({ pregunta, respuesta: answers[index] }))
  });
});

test('rechaza una quinta pregunta frecuente', () => {
  const faqPregunta = Array.from({ length: 5 }, (_, index) => `Pregunta número ${index + 1}`);
  const faqRespuesta = Array.from({ length: 5 }, (_, index) => `Respuesta número ${index + 1}`);
  assert.throws(
    () => productFaqCreateInput({ faqPregunta, faqRespuesta }),
    /máximo de 4/i
  );
});

test('rechaza pares incompletos de pregunta y respuesta', () => {
  assert.throws(
    () => productFaqCreateInput({ faqPregunta: 'Pregunta válida', faqRespuesta: '' }),
    /pregunta y respuesta/i
  );
});

test('conserva identificadores al editar preguntas existentes', () => {
  assert.deepEqual(productFaqEntries({
    faqEditorPresent: '1',
    faqId: ['8', ''],
    faqPregunta: ['Pregunta existente', 'Pregunta nueva'],
    faqRespuesta: ['Respuesta existente', 'Respuesta nueva']
  }), [
    { id: 8, pregunta: 'Pregunta existente', respuesta: 'Respuesta existente' },
    { id: null, pregunta: 'Pregunta nueva', respuesta: 'Respuesta nueva' }
  ]);
});

test('una petición antigua sin editor no elimina preguntas existentes', () => {
  assert.equal(productFaqEntries({ nombre: 'Producto' }), null);
});
