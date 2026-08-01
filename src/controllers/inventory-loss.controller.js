import { InventoryLossService } from '../services/inventory-loss.service.js';

function takeFlash(req) {
  const value = req.session.inventoryLossFlash || null;
  delete req.session.inventoryLossFlash;
  return value;
}

function setFlash(req, type, text) {
  req.session.inventoryLossFlash = { type, text };
}

export class InventoryLossController {
  static async render(req, res) {
    try {
      const [products, losses] = await Promise.all([
        InventoryLossService.products(),
        InventoryLossService.list()
      ]);
      const totals = InventoryLossService.summarize(losses);
      res.render('admin/mermas', {
        admin: res.locals.admin,
        products,
        losses,
        totals,
        flash: takeFlash(req)
      });
    } catch (error) {
      console.error('Error cargando mermas:', error.message);
      res.status(500).send('No se pudo cargar el control de inventario.');
    }
  }

  static async create(req, res) {
    try {
      await InventoryLossService.create(req.body, req.session.adminId);
      setFlash(req, 'success', 'Merma registrada y stock actualizado.');
    } catch (error) {
      setFlash(req, 'error', error.message);
    }
    res.redirect('/admin/mermas');
  }
}
