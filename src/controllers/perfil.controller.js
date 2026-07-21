import prisma from '../config/db.js';
import { ClientOrderCancelService } from '../services/client-order-cancel.service.js';
import { ClientRefundMailService } from '../services/client-refund-mail.service.js';
import { notificarCancelacionClienteWhatsapp } from '../services/admin-whatsapp.service.js';
import { TicketService } from '../services/ticket.service.js';

function redirectPerfil(res, params = {}) {
  const query = new URLSearchParams(params).toString();
  res.redirect(`/perfil${query ? `?${query}` : ''}`);
}

function enviarAvisosCancelacion(pedido) {
  ClientRefundMailService.enviarSolicitud(pedido).catch((error) => {
    console.error('No se pudo enviar correo de devolucion:', error.message);
  });
  notificarCancelacionClienteWhatsapp(pedido).catch((error) => {
    console.error('No se pudo notificar cancelacion por WhatsApp:', error.message);
  });
}

export class PerfilController {
  static async renderPerfil(req, res) {
    try {
      const clienteId = res.locals.cliente.id;
      const [user, pedidos, tickets] = await Promise.all([
        prisma.cliente.findUnique({ where: { id: clienteId } }),
        prisma.pedido.findMany({
          where: { clienteId },
          orderBy: { creadoEn: 'desc' },
          include: {
            items: {
              include: { producto: { include: { categoria: true, subcategoria: true } } }
            },
            direccionEnvio: true,
            comprobantePago: true
          }
        }),
        TicketService.listarCliente(clienteId)
      ]);

      res.render('client/perfil', {
        user,
        pedidos,
        tickets,
        error: req.query.error,
        success: req.query.success
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar tu perfil.');
    }
  }

  static async cancelarPedido(req, res) {
    try {
      const pedidoId = Number.parseInt(req.params.id, 10);
      const pedido = await ClientOrderCancelService.cancelar(
        res.locals.cliente.id,
        pedidoId,
        req.body.motivoCancelacion
      );
      enviarAvisosCancelacion(pedido);
      redirectPerfil(res, { success: 'Solicitud de devolucion registrada. Te notificamos por correo.' });
    } catch (error) {
      console.error(error);
      redirectPerfil(res, { error: error.message || 'No se pudo cancelar el pedido.' });
    }
  }
}
