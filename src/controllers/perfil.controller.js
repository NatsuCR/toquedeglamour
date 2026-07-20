import prisma from '../config/db.js';
import { TicketService } from '../services/ticket.service.js';

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
            items: { include: { producto: true } },
            direccionEnvio: true,
            comprobantePago: true
          }
        }),
        TicketService.listarCliente(clienteId)
      ]);

      res.render('client/perfil', { user, pedidos, tickets });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar tu perfil.');
    }
  }
}
