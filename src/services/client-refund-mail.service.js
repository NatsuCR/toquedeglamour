import { transporter } from './client-auth.service.js';
import { formatMoneyCRC as money } from '../utils/money.js';

const clean = (value) => String(value || '').trim();
const escapeHtml = (value) => clean(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function itemsHtml(pedido) {
  return pedido.items.map((item) => {
    const producto = item.producto || {};
    const nombre = escapeHtml(producto.nombre || 'Producto');
    const sku = `PRD-${String(producto.id || item.productoId).padStart(4, '0')}`;
    return `<li><strong>${item.cantidad} x ${nombre}</strong><br><span>SKU: ${sku}</span></li>`;
  }).join('');
}

function emailHtml(pedido) {
  const codigo = escapeHtml(pedido.codigo || pedido.id);
  const motivo = escapeHtml(pedido.motivoCancelacion || 'No indicado');
  const nombre = escapeHtml(pedido.nombreCliente || pedido.cliente?.nombre || 'Cliente');
  return `
    <div style="font-family:Arial,sans-serif;background:#fff6fa;padding:28px;color:#321a25;">
      <div style="max-width:660px;margin:auto;background:#fff;border:1px solid #ead2dc;border-radius:14px;overflow:hidden;">
        <div style="background:#7b2446;color:#fff;padding:26px 30px;">
          <h1 style="margin:0;font-size:25px;">Solicitud recibida</h1>
          <p style="margin:8px 0 0;color:#ffd6e3;">Pedido ${codigo}</p>
        </div>
        <div style="padding:28px 30px;">
          <p>Hola <strong>${nombre}</strong>, recibimos tu solicitud de devolucion y cancelacion del pedido.</p>
          <p>Tu dinero sera revisado para devolucion en un plazo de <strong>8 dias habiles</strong>.</p>
          <div style="border:1px solid #ead2dc;border-radius:12px;padding:16px;margin:20px 0;background:#fff8fb;">
            <p style="margin:0 0 8px;"><strong>Total:</strong> ${money(pedido.total)}</p>
            <p style="margin:0;"><strong>Motivo indicado:</strong> ${motivo}</p>
          </div>
          <p><strong>Productos incluidos:</strong></p>
          <ul style="line-height:1.7;">${itemsHtml(pedido)}</ul>
          <p>Si necesitas agregar informacion, abre un ticket de soporte desde tu cuenta.</p>
          <p style="color:#7d6470;font-size:13px;">Gracias por confiar en Toque de Glamour.</p>
        </div>
      </div>
    </div>
  `;
}

export class ClientRefundMailService {
  static async enviarSolicitud(pedido) {
    const codigo = pedido.codigo || pedido.id;
    await transporter.sendMail({
      from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
      to: pedido.correoCliente || pedido.cliente.correo,
      subject: `Solicitud de devolucion recibida ${codigo} - Toque de Glamour`,
      html: emailHtml(pedido)
    });
  }
}
