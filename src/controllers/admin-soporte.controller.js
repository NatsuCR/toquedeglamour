import { ticketPayload } from '../services/ticket-presenter.service.js';
import { TicketService } from '../services/ticket.service.js';
import { SupportMailService } from '../services/support-mail.service.js';

const idParam = (req) => Number.parseInt(req.params.id, 10);
const wantsJson = (req) => req.headers.accept?.includes('application/json');

export class AdminSoporteController {
  static async listar(req, res) {
    try {
      const tickets = await TicketService.listarAdmin();
      const activeTab = req.query.estado === 'cerrados' ? 'cerrados' : 'abiertos';
      res.render('admin/soporte', { admin: res.locals.admin, tickets, activeTab });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando tickets.');
    }
  }

  static async detalle(req, res) {
    try {
      const ticket = await TicketService.obtenerAdmin(idParam(req));
      res.render('admin/ticket', { admin: res.locals.admin, ticket });
    } catch (error) {
      console.error(error);
      res.status(404).send(error.message);
    }
  }

  static async mensajes(req, res) {
    try {
      const ticket = await TicketService.obtenerAdmin(idParam(req));
      res.json(ticketPayload(ticket));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async responder(req, res) {
    try {
      await TicketService.responderAdmin(idParam(req), req.body.mensaje, req.files || []);
      if (wantsJson(req)) return res.json(ticketPayload(await TicketService.obtenerAdmin(idParam(req))));
      res.redirect(`/admin/soporte/${req.params.id}`);
    } catch (error) {
      console.error(error);
      if (wantsJson(req)) return res.status(400).json({ error: error.message });
      res.status(400).send(error.message);
    }
  }

  static async cerrar(req, res) {
    try {
      await TicketService.cerrar(idParam(req));
      const ticket = await TicketService.obtenerAdmin(idParam(req));
      SupportMailService.enviarCierre(ticket);
      res.redirect('/admin/soporte?estado=cerrados');
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
}
