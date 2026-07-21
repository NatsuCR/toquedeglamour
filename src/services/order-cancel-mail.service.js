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
    const nombre = escapeHtml(item.producto?.nombre || 'Producto');
    return `<li>${item.cantidad} x ${nombre}</li>`;
  }).join('');
}

function emailHtml(pedido) {
  const codigo = escapeHtml(pedido.codigo || pedido.id);
  const motivo = escapeHtml(pedido.motivoCancelacion || 'No indicado');
  const nombre = escapeHtml(pedido.nombreCliente || pedido.cliente.nombre);
  return `
    <div style="font-family:Arial,sans-serif;background:#fff6fa;padding:28px;color:#321a25;">
      <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #ead2dc;border-radius:12px;overflow:hidden;">
        <div style="background:#7b2446;color:#fff;padding:24px 28px;">
          <h1 style="margin:0;font-size:24px;">Toque de Glamour</h1>
          <p style="margin:8px 0 0;color:#ffd6e3;">Pedido ${codigo} cancelado</p>
        </div>
        <div style="padding:26px 28px;">
          <p>Hola <strong>${nombre}</strong>, tu pedido fue cancelado por administración.</p>
          <div style="border:1px solid #ead2dc;border-radius:10px;padding:16px;margin:20px 0;background:#fff8fb;">
            <p style="margin:0 0 8px;"><strong>Codigo:</strong> ${codigo}</p>
            <p style="margin:0 0 8px;"><strong>Total:</strong> ${money(pedido.total)}</p>
            <p style="margin:0;"><strong>Motivo:</strong> ${motivo}</p>
          </div>
          <p><strong>Productos del pedido:</strong></p>
          <ul>${itemsHtml(pedido)}</ul>
          <p>Si tienes dudas, puedes abrir un ticket de soporte desde tu cuenta.</p>
          <p style="color:#7d6470;font-size:13px;">Toque de Glamour - tienda de cosmeticos y cuidado personal.</p>
        </div>
      </div>
    </div>
  `;
}

export class OrderCancelMailService {
  static async enviarCancelacion(pedido) {
    const codigo = pedido.codigo || pedido.id;
    await transporter.sendMail({
      from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
      to: pedido.correoCliente || pedido.cliente.correo,
      subject: `Pedido cancelado ${codigo} - Toque de Glamour`,
      html: emailHtml(pedido)
    });
  }
}
