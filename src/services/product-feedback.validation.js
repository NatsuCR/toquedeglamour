export const feedbackText = (value) => String(value || '').trim();

export function feedbackId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) throw new Error('Selecciona un registro válido.');
  return id;
}

export function feedbackRating(value) {
  const number = Number.parseInt(value, 10);
  if (number < 1 || number > 5) throw new Error('La calificación debe ser de 1 a 5 estrellas.');
  return number;
}

export function validComment(value) {
  const comment = feedbackText(value);
  if (comment.length < 3 || comment.length > 1500) {
    throw new Error('El comentario debe tener entre 3 y 1.500 caracteres.');
  }
  return comment;
}

export function officialReviewSource(data) {
  const fuenteOficial = data.fuenteOficial === 'on' || data.fuenteOficial === true;
  if (!fuenteOficial) return {
    fuenteOficial: false, fuenteNombre: null, fuenteUrl: null, fechaOriginal: null
  };
  const fuenteNombre = feedbackText(data.fuenteNombre);
  if (fuenteNombre.length < 2 || fuenteNombre.length > 100) {
    throw new Error('Indica el nombre de la fuente oficial.');
  }
  const fuenteUrl = validSourceUrl(data.fuenteUrl);
  const fechaOriginal = validSourceDate(data.fechaOriginal);
  return { fuenteOficial, fuenteNombre, fuenteUrl, fechaOriginal };
}

function validSourceUrl(value) {
  const text = feedbackText(value);
  if (!text) return null;
  if (text.length > 500) throw new Error('El enlace de la fuente es demasiado largo.');
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw new Error('Escribe un enlace válido para la fuente oficial.');
  }
}

function validSourceDate(value) {
  const text = feedbackText(value);
  if (!text) return null;
  const date = new Date(`${text}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error('La fecha original no es válida.');
  return date;
}

export function validFaq(questionValue, answerValue) {
  const pregunta = feedbackText(questionValue);
  const respuesta = feedbackText(answerValue);
  if (pregunta.length < 5 || pregunta.length > 250 || respuesta.length < 5 || respuesta.length > 2000) {
    throw new Error('Completa una pregunta y respuesta válidas.');
  }
  return { pregunta, respuesta };
}
