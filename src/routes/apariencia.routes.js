import { Router } from 'express';
import { requireAdminAuth } from '../middlewares/auth.middleware.js';
import { requireOwnerRole } from '../middlewares/role.middleware.js';
import { AparienciaController } from '../controllers/apariencia.controller.js';
import { uploadBrandingImages, handleBrandingUploadError } from '../middlewares/branding-upload.middleware.js';

const router = Router();

router.get('/', requireAdminAuth, requireOwnerRole, AparienciaController.render);
router.post(
  '/',
  requireAdminAuth,
  requireOwnerRole,
  uploadBrandingImages.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'heroImage', maxCount: 1 },
    { name: 'heroImages', maxCount: 8 }
  ]),
  handleBrandingUploadError,
  AparienciaController.update
);

export default router;
