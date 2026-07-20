import { notificarTicketWhatsapp } from '../services/admin-whatsapp.service.js';
import { SupportMailService } from '../services/support-mail.service.js';
import { ticketPayload } from '../services/ticket-presenter.service.js';
import { TicketService } from '../services/ticket.service.js';
import { ProductoService } from '../services/producto.service.js';

const idParam = (req) => Number.parseInt(req.params.id, 10);
const wantsJson = (req) => req.headers.accept?.includes('application/json');

export class SoporteController {
  static async listar(req, res) {
    try {
      const tickets = await TicketService.listarCliente(res.locals.cliente.id);
      const error = req.session.supportError || null;
      delete req.session.supportError;
      const activeTab = req.query.estado === 'cerrados' ? 'cerrados' : 'abiertos';
      const prefill = await consultaPrefill(req.query.producto);
      res.render('client/soporte', { user: res.locals.cliente, tickets, error, activeTab, prefill });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error cargando soporte.');
    }
  }

  static async crear(req, res) {
    try {
      const ticket = await TicketService.crear(res.locals.cliente.id, req.body, req.files || []);
      SupportMailService.enviarConfirmacion(ticket);
      notificarTicketWhatsapp(ticket).catch((error) => {
        console.error('No se pudo notificar ticket por WhatsApp:', error.message);
      });
      res.redirect(`/soporte/${ticket.id}`);
    } catch (error) {
      req.session.supportError = error.message;
      res.redirect('/soporte');
    }
  }

  static async detalle(req, res) {
    try {
      const ticket = await TicketService.obtenerCliente(idParam(req), res.locals.cliente.id);
      res.render('client/ticket', { user: res.locals.cliente, ticket });
    } catch (error) {
      console.error(error);
      res.status(404).send(error.message);
    }
  }

  static async mensajes(req, res) {
    try {
      const ticket = await TicketService.obtenerCliente(idParam(req), res.locals.cliente.id);
      res.json(ticketPayload(ticket));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async responder(req, res) {
    try {
      await TicketService.responderCliente(idParam(req), res.locals.cliente.id, req.body.mensaje, req.files || []);
      if (wantsJson(req)) {
        const ticket = await TicketService.obtenerCliente(idParam(req), res.locals.cliente.id);
        return res.json(ticketPayload(ticket));
      }
      res.redirect(`/soporte/${req.params.id}`);
    } catch (error) {
      console.error(error);
      if (wantsJson(req)) return res.status(400).json({ error: error.message });
      res.status(400).send(error.message);
    }
  }
}

async function consultaPrefill(productoId) {
  if (!productoId) return { asunto: '', mensaje: '' };
  const producto = await ProductoService.obtenerPorId(productoId);
  if (!producto || producto.tipoVenta !== 'CONSULTA') return { asunto: '', mensaje: '' };
  return {
    asunto: `Consulta: ${producto.nombre}`,
    mensaje: `Hola, me interesa consultar disponibilidad, detalles y precio de ${producto.nombre}.`
  };
}
