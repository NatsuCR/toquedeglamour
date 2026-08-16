import { Router } from 'express';
import { ProductFeedbackController } from '../controllers/product-feedback.controller.js';
import { AdminFeedbackController } from '../controllers/admin-feedback.controller.js';

const router = Router();

router.post('/comentarios', ProductFeedbackController.adminReview);
router.put('/comentarios/:id', AdminFeedbackController.updateReview);
router.delete('/comentarios/:id', AdminFeedbackController.deleteReview);
router.post('/comentarios/:id/respuesta', AdminFeedbackController.replyReview);
router.delete('/comentarios/:id/respuesta', AdminFeedbackController.clearReply);
router.post('/preguntas', ProductFeedbackController.adminFaq);
router.put('/preguntas/:id', AdminFeedbackController.updateFaq);
router.delete('/preguntas/:id', AdminFeedbackController.deleteFaq);

export default router;
