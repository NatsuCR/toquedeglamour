import { validFaq } from './product-feedback.validation.js';

const MAX_FAQS = 4;

function list(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

export function productFaqCreateInput(data = {}) {
  const entries = productFaqEntries(data) || [];
  return entries.length ? {
    create: entries.map(({ pregunta, respuesta }) => ({ pregunta, respuesta }))
  } : undefined;
}

export function productFaqEntries(data = {}) {
  const hasEditor = data.faqEditorPresent || data.faqId !== undefined ||
    data.faqPregunta !== undefined || data['faqPregunta[]'] !== undefined;
  if (!hasEditor) return null;
  const ids = list(data.faqId ?? data['faqId[]']);
  const questions = list(data.faqPregunta ?? data['faqPregunta[]']);
  const answers = list(data.faqRespuesta ?? data['faqRespuesta[]']);
  const entries = [];

  for (let index = 0; index < Math.max(questions.length, answers.length); index += 1) {
    const question = String(questions[index] || '').trim();
    const answer = String(answers[index] || '').trim();
    if (!question && !answer) continue;
    if (!question || !answer) {
      throw new Error('Cada pregunta frecuente debe incluir su pregunta y respuesta.');
    }
    const rawId = String(ids[index] || '').trim();
    const id = rawId ? Number.parseInt(rawId, 10) : null;
    if (rawId && (!Number.isInteger(id) || id < 1)) {
      throw new Error('Una pregunta frecuente contiene un identificador inválido.');
    }
    entries.push({ id, ...validFaq(question, answer) });
  }

  if (entries.length > MAX_FAQS) {
    throw new Error('Un producto puede tener un máximo de 4 preguntas frecuentes.');
  }
  return entries;
}
