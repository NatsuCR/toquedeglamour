import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { CategoriaController } from '../controllers/categoria.controller.js';
import { ProductoController } from '../controllers/producto.controller.js';
import { AdminPedidosController } from '../controllers/admin-pedidos.controller.js';
import { AdminSoporteController } from '../controllers/admin-soporte.controller.js';
import { AdminUsuariosController } from '../controllers/admin-usuarios.controller.js';
import { AnnouncementController } from '../controllers/announcement.controller.js';
import { FinanceController } from '../controllers/finance.controller.js';
import { BrandCollaborationController } from '../controllers/brand-collaboration.controller.js';
import { SalesController } from '../controllers/sales.controller.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { InventoryLossController } from '../controllers/inventory-loss.controller.js';
import { requireOwnerRole } from '../middlewares/role.middleware.js';
import {
  requireAdminAuth,
  redirectIfAdminAuthenticated,
  loginRateLimiter
} from '../middlewares/auth.middleware.js';
import { uploadProductImage, handleUploadError } from '../middlewares/upload.middleware.js';
import { uploadSoporte, handleSupportUploadError } from '../middlewares/support-upload.middleware.js';
import { uploadGasto, handleExpenseUploadError } from '../middlewares/expense-upload.middleware.js';
import { uploadBrandCollab, handleBrandCollabUploadError } from '../middlewares/brand-upload.middleware.js';
import { uploadSaleProofs, handleSaleProofError } from '../middlewares/sales-proof-upload.middleware.js';

const router = Router();
const staff = [requireAdminAuth];
const admin = [requireAdminAuth, requireOwnerRole];
const productUpload = [requireAdminAuth, requireOwnerRole, uploadProductImage.array('imagenes', 8), handleUploadError];
const supportUpload = [requireAdminAuth, requireOwnerRole, uploadSoporte.array('adjuntos', 4), handleSupportUploadError];
const expenseUpload = [requireAdminAuth, requireOwnerRole, uploadGasto.single('comprobante'), handleExpenseUploadError];
const brandUpload = [requireAdminAuth, requireOwnerRole, uploadBrandCollab.single('imagen'), handleBrandCollabUploadError];
const salesUpload = [requireAdminAuth, uploadSaleProofs.array('comprobantes', 4), handleSaleProofError];

router.get('/login', redirectIfAdminAuthenticated, AdminController.renderLoginForm);
router.post('/login', redirectIfAdminAuthenticated, loginRateLimiter, AdminController.processLogin);
router.get('/', staff, (req, res) => {
  res.redirect(res.locals.admin.rol === 'EMPLEADO' ? '/admin/ventas' : '/admin/dashboard');
});
router.get('/logout', staff, AdminController.logout);
router.get('/ventas', staff, SalesController.render);
router.post('/ventas', salesUpload, SalesController.create);
router.get('/dashboard', admin, AdminController.renderDashboard);
router.get('/analitica', admin, AnalyticsController.renderAdmin);
router.post('/analitica/eliminar', admin, AnalyticsController.clearAll);
router.get('/finanzas', admin, FinanceController.render);
router.post('/finanzas/iva', admin, FinanceController.actualizarIva);
router.post('/finanzas/gastos', expenseUpload, FinanceController.crearGasto);
router.post('/finanzas/gastos/:id/eliminar', admin, FinanceController.eliminarGasto);
router.get('/finanzas/exportar', admin, FinanceController.exportar);

router.get('/correos', admin, AnnouncementController.render);
router.post('/correos', admin, AnnouncementController.enviar);
router.get('/anuncios', admin, (req, res) => res.redirect('/admin/correos'));
router.post('/anuncios', admin, AnnouncementController.enviar);

router.get('/marcas', admin, BrandCollaborationController.admin);
router.post('/marcas', brandUpload, BrandCollaborationController.crear);
router.post('/marcas/:id/eliminar', admin, BrandCollaborationController.eliminar);

router.get('/categorias', admin, CategoriaController.listar);
router.post('/categorias', admin, CategoriaController.crear);
router.put('/categorias/:id', admin, CategoriaController.actualizar);
router.delete('/categorias/:id', admin, CategoriaController.eliminar);
router.post('/categorias/:id/subcategorias', admin, CategoriaController.crearSubcategoria);
router.post('/subcategorias/:id/eliminar', admin, CategoriaController.eliminarSubcategoria);

router.get('/productos', admin, ProductoController.listar);
router.post('/productos', productUpload, ProductoController.crear);
router.put('/productos/:id', productUpload, ProductoController.actualizar);
router.delete('/productos/:id', admin, ProductoController.eliminar);
router.get('/mermas', admin, InventoryLossController.render);
router.post('/mermas', admin, InventoryLossController.create);

router.get('/usuarios', admin, AdminUsuariosController.listar);
router.post('/usuarios/clientes', admin, AdminUsuariosController.crearCliente);
router.post('/usuarios/clientes/:id/eliminar', admin, AdminUsuariosController.eliminarCliente);
router.post('/usuarios/admins', admin, AdminUsuariosController.crearAdmin);
router.post('/usuarios/admins/:id/eliminar', admin, AdminUsuariosController.eliminarAdmin);

router.get('/pedidos', admin, AdminPedidosController.renderPedidos);
router.post('/pedidos/:id/estado', admin, AdminPedidosController.actualizarEstado);
router.post('/pedidos/:id/fase', admin, AdminPedidosController.actualizarFase);
router.post('/pedidos/:id/cancelar', admin, AdminPedidosController.cancelar);

router.get('/soporte', admin, AdminSoporteController.listar);
router.get('/soporte/:id', admin, AdminSoporteController.detalle);
router.get('/soporte/:id/mensajes', admin, AdminSoporteController.mensajes);
router.post('/soporte/:id/responder', supportUpload, AdminSoporteController.responder);
router.post('/soporte/:id/cerrar', admin, AdminSoporteController.cerrar);

router.get('/api/dashboard-stats', admin, AdminController.getDashboardStats);
router.use((req, res) => res.status(404).send('Ruta administrativa no encontrada en /admin.'));

export default router;
