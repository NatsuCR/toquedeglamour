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

export function validFaq(questionValue, answerValue) {
  const pregunta = feedbackText(questionValue);
  const respuesta = feedbackText(answerValue);
  if (pregunta.length < 5 || pregunta.length > 250 || respuesta.length < 5 || respuesta.length > 2000) {
    throw new Error('Completa una pregunta y respuesta válidas.');
  }
  return { pregunta, respuesta };
}
