import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { CategoriaController } from '../controllers/categoria.controller.js';
import { ProductoController } from '../controllers/producto.controller.js';
import { AdminPedidosController } from '../controllers/admin-pedidos.controller.js';
import { AdminSoporteController } from '../controllers/admin-soporte.controller.js';
import { AdminUsuariosController } from '../controllers/admin-usuarios.controller.js';
import { FinanceController } from '../controllers/finance.controller.js';
import { BrandCollaborationController } from '../controllers/brand-collaboration.controller.js';
import {
  requireAdminAuth,
  redirectIfAdminAuthenticated,
  loginRateLimiter
} from '../middlewares/auth.middleware.js';
import { uploadProductImage, handleUploadError } from '../middlewares/upload.middleware.js';
import { uploadSoporte, handleSupportUploadError } from '../middlewares/support-upload.middleware.js';
import { uploadGasto, handleExpenseUploadError } from '../middlewares/expense-upload.middleware.js';
import { uploadBrandCollab, handleBrandCollabUploadError } from '../middlewares/brand-upload.middleware.js';

const router = Router();
const admin = [requireAdminAuth];
const productUpload = [requireAdminAuth, uploadProductImage.single('imagen'), handleUploadError];
const supportUpload = [requireAdminAuth, uploadSoporte.array('adjuntos', 4), handleSupportUploadError];
const expenseUpload = [requireAdminAuth, uploadGasto.single('comprobante'), handleExpenseUploadError];
const brandUpload = [requireAdminAuth, uploadBrandCollab.single('imagen'), handleBrandCollabUploadError];

router.get('/login', redirectIfAdminAuthenticated, AdminController.renderLoginForm);
router.post('/login', redirectIfAdminAuthenticated, loginRateLimiter, AdminController.processLogin);
router.get('/logout', admin, AdminController.logout);
router.get('/dashboard', admin, AdminController.renderDashboard);
router.get('/finanzas', admin, FinanceController.render);
router.post('/finanzas/iva', admin, FinanceController.actualizarIva);
router.post('/finanzas/gastos', expenseUpload, FinanceController.crearGasto);
router.post('/finanzas/gastos/:id/eliminar', admin, FinanceController.eliminarGasto);
router.get('/finanzas/exportar', admin, FinanceController.exportar);

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

router.get('/usuarios', admin, AdminUsuariosController.listar);
router.post('/usuarios/clientes', admin, AdminUsuariosController.crearCliente);
router.post('/usuarios/clientes/:id/eliminar', admin, AdminUsuariosController.eliminarCliente);
router.post('/usuarios/admins', admin, AdminUsuariosController.crearAdmin);
router.post('/usuarios/admins/:id/eliminar', admin, AdminUsuariosController.eliminarAdmin);

router.get('/pedidos', admin, AdminPedidosController.renderPedidos);
router.post('/pedidos/:id/estado', admin, AdminPedidosController.actualizarEstado);
router.post('/pedidos/:id/fase', admin, AdminPedidosController.actualizarFase);

router.get('/soporte', admin, AdminSoporteController.listar);
router.get('/soporte/:id', admin, AdminSoporteController.detalle);
router.get('/soporte/:id/mensajes', admin, AdminSoporteController.mensajes);
router.post('/soporte/:id/responder', supportUpload, AdminSoporteController.responder);
router.post('/soporte/:id/cerrar', admin, AdminSoporteController.cerrar);

router.get('/api/dashboard-stats', admin, AdminController.getDashboardStats);
router.use((req, res) => res.status(404).send('Ruta administrativa no encontrada en /admin.'));

export default router;
