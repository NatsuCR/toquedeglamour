import { ProductFeedbackAdminService } from '../services/product-feedback-admin.service.js';

const redirect = (req, res, type, message, anchor) => {
  req.session.promotionsFlash = { type, message };
  res.redirect(`/admin/promociones#${anchor}`);
};

async function action(req, res, task, success, anchor) {
  try {
    await task();
    redirect(req, res, 'success', success, anchor);
  } catch (error) {
    redirect(req, res, 'error', error.message, anchor);
  }
}

export class AdminFeedbackController {
  static updateReview(req, res) {
    return action(req, res,
      () => ProductFeedbackAdminService.updateReview(req.params.id, req.body),
      'Comentario actualizado.', 'admin-reviews');
  }

  static deleteReview(req, res) {
    return action(req, res,
      () => ProductFeedbackAdminService.deleteReview(req.params.id),
      'Comentario eliminado.', 'admin-reviews');
  }

  static replyReview(req, res) {
    return action(req, res,
      () => ProductFeedbackAdminService.replyReview(req.params.id, req.body.respuestaAdmin),
      'Respuesta de Admin guardada.', 'admin-reviews');
  }

  static clearReply(req, res) {
    return action(req, res,
      () => ProductFeedbackAdminService.clearReply(req.params.id),
      'Respuesta de Admin eliminada.', 'admin-reviews');
  }

  static updateFaq(req, res) {
    return action(req, res,
      () => ProductFeedbackAdminService.updateFaq(req.params.id, req.body),
      'Pregunta frecuente actualizada.', 'admin-faqs');
  }

  static deleteFaq(req, res) {
    return action(req, res,
      () => ProductFeedbackAdminService.deleteFaq(req.params.id),
      'Pregunta frecuente eliminada.', 'admin-faqs');
  }
}
