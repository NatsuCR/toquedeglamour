import prisma from '../config/db.js';
import { AdminOrderService } from './admin-order.service.js';

const WINDOW_HOURS = 48;
const MS_PER_HOUR = 60 * 60 * 1000;

function hoursSince(date, now = new Date()) {
  return (now.getTime() - new Date(date).getTime()) / MS_PER_HOUR;
}

function assertCancelable(pedido, now) {
  if (pedido.estado === 'RECHAZADO') throw new Error('Este pedido ya fue cancelado.');
  if (pedido.estado === 'ENTREGADO' || pedido.fase === 'COMPLETADO') {
    throw new Error('Este pedido ya fue completado y no puede cancelarse.');
  }
  if (hoursSince(pedido.creadoEn, now) > WINDOW_HOURS) {
    throw new Error('Paso el plazo de 48 horas para solicitar la devolucion.');
  }
}

export class ClientOrderCancelService {
  static async cancelar(clienteId, pedidoId, motivo) {
    if (!Number.isInteger(pedidoId)) throw new Error('Pedido invalido.');

    const detalle = String(motivo || '').trim();
    if (detalle.length < 8) throw new Error('Escribe un motivo de cancelacion mas claro.');

    const pedido = await prisma.pedido.findFirst({
      where: { id: pedidoId, clienteId },
      select: { id: true, estado: true, fase: true, creadoEn: true }
    });
    if (!pedido) throw new Error('Pedido no encontrado.');

    assertCancelable(pedido, new Date());
    const resultado = await AdminOrderService.cancelarPedido(pedidoId, detalle);
    return resultado.pedido;
  }
}
