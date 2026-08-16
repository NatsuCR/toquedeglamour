import { ProductFeedbackService } from '../services/product-feedback.service.js';

export class ProductFeedbackController {
  static async clientReview(req, res) {
    try {
      await ProductFeedbackService.addClientReview(res.locals.cliente.id, req.params.id, req.body);
      res.redirect(`/producto/${req.params.id}?review=success#comentarios`);
    } catch (error) {
      res.redirect(`/producto/${req.params.id}?reviewError=${encodeURIComponent(error.message)}#comentarios`);
    }
  }

  static async adminReview(req, res) {
    try {
      await ProductFeedbackService.addAdminReview(req.body);
      req.session.promotionsFlash = { type: 'success', message: 'Comentario agregado al producto.' };
    } catch (error) {
      req.session.promotionsFlash = { type: 'error', message: error.message };
    }
    res.redirect('/admin/promociones');
  }

  static async adminFaq(req, res) {
    try {
      await ProductFeedbackService.addFaq(req.body);
      req.session.promotionsFlash = { type: 'success', message: 'Pregunta frecuente agregada.' };
    } catch (error) {
      req.session.promotionsFlash = { type: 'error', message: error.message };
    }
    res.redirect('/admin/promociones');
  }
}
