import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';
import { ClientAuthController } from '../controllers/client-auth.controller.js';
import { PasswordResetController } from '../controllers/password-reset.controller.js';
import { CartController } from '../controllers/cart.controller.js';
import { CheckoutController } from '../controllers/checkout.controller.js';
import { PerfilController } from '../controllers/perfil.controller.js';
import { ProfileSettingsController } from '../controllers/profile-settings.controller.js';
import { SoporteController } from '../controllers/soporte.controller.js';
import { LegalController } from '../controllers/legal.controller.js';
import { BrandCollaborationController } from '../controllers/brand-collaboration.controller.js';
import {
  requireClientAuth,
  redirectIfClientAuthenticated,
  requireClientVerified,
  injectUserState
} from '../middlewares/client-auth.middleware.js';
import { loginRateLimiter } from '../middlewares/auth.middleware.js';
import { uploadComprobante, handleComprobanteError } from '../middlewares/comprobante-upload.middleware.js';
import { uploadSoporte, handleSupportUploadError } from '../middlewares/support-upload.middleware.js';

const router = Router();
const clienteActivo = [requireClientAuth];
const clienteVerificado = [requireClientAuth, requireClientVerified];
const soporteUpload = [requireClientAuth, uploadSoporte.array('adjuntos', 4), handleSupportUploadError];

router.use(injectUserState);

router.get('/', ClientController.renderIndex);
router.get('/catalogo', ClientController.renderCatalogo);
router.get('/marcas', BrandCollaborationController.publico);
router.get('/quienes-somos', ClientController.renderQuienesSomos);
router.get('/ubicacion', ClientController.renderUbicacion);
router.get('/terminos-condiciones', LegalController.terminos);
router.get('/politica-privacidad', LegalController.privacidad);
router.get('/politica-envios', LegalController.envios);
router.get('/cambios-devoluciones', LegalController.cambios);

router.get('/carrito', CartController.renderCarrito);
router.post('/carrito/agregar', CartController.agregarItem);
router.post('/carrito/actualizar', CartController.actualizarItem);
router.post('/carrito/eliminar', CartController.eliminarItem);

router.get('/checkout', clienteVerificado, CheckoutController.renderCheckout);
router.post(
  '/checkout',
  clienteVerificado,
  uploadComprobante.single('comprobante'),
  handleComprobanteError,
  CheckoutController.procesarCheckout
);

router.get('/perfil', clienteActivo, PerfilController.renderPerfil);
router.get('/perfil/configuracion', clienteActivo, ProfileSettingsController.render);
router.post('/perfil/configuracion/celulares', clienteActivo, ProfileSettingsController.celulares);
router.post('/perfil/configuracion/correo', clienteActivo, ProfileSettingsController.solicitarCorreo);
router.post('/perfil/configuracion/correo/confirmar', clienteActivo, ProfileSettingsController.confirmarCorreo);
router.post('/perfil/configuracion/password', clienteActivo, ProfileSettingsController.password);
router.get('/soporte', clienteActivo, SoporteController.listar);
router.post('/soporte', soporteUpload, SoporteController.crear);
router.get('/soporte/:id', clienteActivo, SoporteController.detalle);
router.get('/soporte/:id/mensajes', clienteActivo, SoporteController.mensajes);
router.post('/soporte/:id/responder', soporteUpload, SoporteController.responder);

router.get('/login', redirectIfClientAuthenticated, ClientAuthController.renderLogin);
router.post('/login', redirectIfClientAuthenticated, loginRateLimiter, ClientAuthController.processLogin);
router.get('/password/olvido', redirectIfClientAuthenticated, PasswordResetController.renderSolicitar);
router.post('/password/olvido', redirectIfClientAuthenticated, PasswordResetController.solicitar);
router.get('/password/restablecer', redirectIfClientAuthenticated, PasswordResetController.renderRestablecer);
router.post('/password/restablecer', redirectIfClientAuthenticated, PasswordResetController.restablecer);
router.get('/registro', redirectIfClientAuthenticated, ClientAuthController.renderRegistro);
router.post('/registro', redirectIfClientAuthenticated, ClientAuthController.processRegistro);
router.get('/verificar', ClientAuthController.renderVerificar);
router.post('/verificar', ClientAuthController.processVerificar);
router.get('/logout', clienteActivo, ClientAuthController.logout);
router.get('/producto/:id', ClientController.renderProductoDetalle);

export default router;
