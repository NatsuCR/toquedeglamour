import prisma from '../config/db.js';
import {
  feedbackId, feedbackRating, feedbackText, officialReviewSource, validComment, validFaq
} from './product-feedback.validation.js';

export class ProductFeedbackService {
  static async addClientReview(clientId, product, data) {
    const id = feedbackId(clientId);
    const client = await prisma.cliente.findUnique({ where: { id } });
    if (!client) throw new Error('Debes iniciar sesión para comentar.');
    const comentario = validComment(data.comentario);
    return prisma.resenaProducto.create({
      data: {
        productoId: feedbackId(product),
        clienteId: client.id,
        nombre: `${client.nombre} ${client.apellidos}`.trim(),
        comentario, calificacion: feedbackRating(data.calificacion)
      }
    });
  }

  static async addAdminReview(data) {
    const nombre = feedbackText(data.nombre);
    const comentario = validComment(data.comentario);
    if (nombre.length < 2) throw new Error('Escribe el nombre que se mostrará.');
    const source = officialReviewSource(data);
    return prisma.resenaProducto.create({
      data: {
        productoId: feedbackId(data.productoId), nombre, comentario,
        calificacion: feedbackRating(data.calificacion), creadaPorAdmin: true,
        ...source
      }
    });
  }

  static async addFaq(data) {
    const id = feedbackId(data.productoId);
    const { pregunta, respuesta } = validFaq(data.pregunta, data.respuesta);
    return prisma.$transaction(async (tx) => {
      const count = await tx.preguntaFrecuente.count({ where: { productoId: id } });
      if (count >= 4) throw new Error('Este producto ya tiene el máximo de 4 preguntas frecuentes.');
      return tx.preguntaFrecuente.create({ data: { productoId: id, pregunta, respuesta } });
    });
  }
}
