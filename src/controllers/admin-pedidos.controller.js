import prisma from '../config/db.js';
import { AdminOrderService, pedidoIncludeCompleto } from '../services/admin-order.service.js';
import { OrderMailService } from '../services/order-mail.service.js';
import { OrderCancelMailService } from '../services/order-cancel-mail.service.js';

const ESTADOS = ['PENDIENTE_VERIFICACION', 'PAGO_CONFIRMADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'RECHAZADO'];

function faseAgrupada(pedido) {
  if (pedido.estado === 'RECHAZADO') return 'CANCELADO';
  if (pedido.tipoEntrega === 'LOCAL' && pedido.fase === 'ENVIADO') return 'LISTO';
  if (pedido.estado === 'ENTREGADO') return 'COMPLETADO';
  return pedido.fase || 'PREPARACION';
}

function estadosPermitidos(pedido) {
  return pedido.tipoEntrega === 'LOCAL' ? ESTADOS.filter((estado) => estado !== 'ENVIADO') : ESTADOS;
}

function fasesPermitidas(pedido) {
  return pedido.tipoEntrega === 'LOCAL'
    ? ['PREPARACION', 'LISTO', 'COMPLETADO']
    : ['PREPARACION', 'LISTO', 'ENVIADO', 'COMPLETADO'];
}

function enviarCorreoCompletado(resultado) {
  if (!resultado.completadoNuevo) return;
  OrderMailService.enviarCompletado(resultado.pedido).catch((error) => {
    console.error('No se pudo enviar correo de pedido completado:', error.message);
  });
}

function enviarCorreoCancelado(resultado) {
  if (!resultado.canceladoNuevo) return;
  OrderCancelMailService.enviarCancelacion(resultado.pedido).catch((error) => {
    console.error('No se pudo enviar correo de pedido cancelado:', error.message);
  });
}

export class AdminPedidosController {
  static async renderPedidos(req, res) {
    try {
      const registros = await prisma.pedido.findMany({
        orderBy: { creadoEn: 'desc' },
        include: pedidoIncludeCompleto
      });
      const pedidos = registros.map((pedido) => ({ ...pedido, faseAgrupada: faseAgrupada(pedido) }));
      res.render('admin/pedidos', { admin: res.locals.admin, pedidos });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar la lista de pedidos.');
    }
  }

  static async actualizarEstado(req, res) {
    try {
      const pedidoId = Number.parseInt(req.params.id, 10);
      const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
      if (!pedido) return res.status(404).send('Pedido no encontrado.');
      if (!estadosPermitidos(pedido).includes(req.body.estado)) return res.status(400).send('Estado invalido.');
      if (req.body.estado === 'RECHAZADO') return res.status(400).send('Usa el formulario de cancelacion con motivo.');
      const data = { estado: req.body.estado };
      if (req.body.estado === 'ENTREGADO') data.fase = 'COMPLETADO';
      enviarCorreoCompletado(await AdminOrderService.actualizarPedido(pedidoId, data));
      res.redirect('/admin/pedidos');
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message || 'Error al actualizar el estado del pedido.');
    }
  }

  static async actualizarFase(req, res) {
    try {
      const pedidoId = Number.parseInt(req.params.id, 10);
      const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
      if (!pedido) return res.status(404).send('Pedido no encontrado.');
      if (!fasesPermitidas(pedido).includes(req.body.fase)) return res.status(400).send('Fase invalida.');
      const data = { fase: req.body.fase };
      if (req.body.fase === 'COMPLETADO') data.estado = 'ENTREGADO';
      enviarCorreoCompletado(await AdminOrderService.actualizarPedido(pedidoId, data));
      res.redirect('/admin/pedidos');
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message || 'Error al actualizar la fase del pedido.');
    }
  }

  static async cancelar(req, res) {
    try {
      const pedidoId = Number.parseInt(req.params.id, 10);
      const resultado = await AdminOrderService.cancelarPedido(pedidoId, req.body.motivoCancelacion);
      enviarCorreoCancelado(resultado);
      res.redirect('/admin/pedidos');
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message || 'Error al cancelar el pedido.');
    }
  }
}
