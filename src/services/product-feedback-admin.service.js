import prisma from '../config/db.js';
import {
  feedbackId, feedbackRating, feedbackText, validComment, validFaq
} from './product-feedback.validation.js';

export class ProductFeedbackAdminService {
  static async updateReview(reviewId, data) {
    const id = feedbackId(reviewId);
    const review = await prisma.resenaProducto.findUnique({ where: { id } });
    if (!review) throw new Error('Comentario no encontrado.');
    const nombre = review.creadaPorAdmin ? feedbackText(data.nombre) : review.nombre;
    if (review.creadaPorAdmin && nombre.length < 2) throw new Error('Escribe el nombre visible.');
    return prisma.resenaProducto.update({
      where: { id },
      data: {
        nombre,
        comentario: validComment(data.comentario),
        calificacion: feedbackRating(data.calificacion)
      }
    });
  }

  static deleteReview(reviewId) {
    return prisma.resenaProducto.delete({ where: { id: feedbackId(reviewId) } });
  }

  static async replyReview(reviewId, value) {
    const respuestaAdmin = feedbackText(value);
    if (respuestaAdmin.length < 3 || respuestaAdmin.length > 1500) {
      throw new Error('La respuesta debe tener entre 3 y 1.500 caracteres.');
    }
    return prisma.resenaProducto.update({
      where: { id: feedbackId(reviewId) },
      data: { respuestaAdmin, respondidaEn: new Date() }
    });
  }

  static clearReply(reviewId) {
    return prisma.resenaProducto.update({
      where: { id: feedbackId(reviewId) },
      data: { respuestaAdmin: null, respondidaEn: null }
    });
  }

  static updateFaq(faqId, data) {
    return prisma.preguntaFrecuente.update({
      where: { id: feedbackId(faqId) },
      data: validFaq(data.pregunta, data.respuesta)
    });
  }

  static deleteFaq(faqId) {
    return prisma.preguntaFrecuente.delete({ where: { id: feedbackId(faqId) } });
  }
}
