import { InvoiceService } from './invoice.service.js';
import { transporter } from './client-auth.service.js';
import { formatMoneyCRC as money } from '../utils/money.js';
import { formatWeight } from './shipping.service.js';

const metodo = { SINPE: 'SINPE Movil', DEPOSITO: 'Transaccion bancaria' };

function emailHtml(pedido, completado = false) {
  const codigo = pedido.codigo || pedido.id;
  const titulo = completado ? `Pedido ${codigo} completado` : `Recibimos tu pedido ${codigo}`;
  const intro = completado
    ? 'Tu pedido fue marcado como completado. Gracias por confiar en Toque de Glamour.'
    : 'Gracias por tu compra.';
  const cierre = completado
    ? 'Adjuntamos nuevamente el comprobante de compra para tu respaldo.'
    : 'Validaremos el comprobante y te mantendremos al tanto de la fase del pedido.';
  return `
    <div style="font-family:Arial,sans-serif;background:#fff6fa;padding:28px;color:#321a25;">
      <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #ead2dc;border-radius:12px;overflow:hidden;">
        <div style="background:#7b2446;color:#fff;padding:24px 28px;">
          <h1 style="margin:0;font-size:24px;">Toque de Glamour</h1>
          <p style="margin:8px 0 0;color:#ffd6e3;">${titulo}</p>
        </div>
        <div style="padding:26px 28px;">
          <p>Hola <strong>${pedido.cliente.nombre}</strong>, ${intro}</p>
          <p>Adjuntamos un comprobante profesional con el detalle de tu pedido.</p>
          <div style="border:1px solid #ead2dc;border-radius:10px;padding:16px;margin:20px 0;background:#fff8fb;">
            <p style="margin:0 0 8px;"><strong>Codigo:</strong> ${codigo}</p>
            <p style="margin:0 0 8px;"><strong>Metodo de pago:</strong> ${metodo[pedido.metodoPago] || pedido.metodoPago}</p>
            <p style="margin:0 0 8px;"><strong>Peso:</strong> ${formatWeight(pedido.pesoTotalGramos || 0)}</p>
            <p style="margin:0;"><strong>Total:</strong> ${money(pedido.total)}</p>
          </div>
          <p>${cierre}</p>
          <p style="color:#7d6470;font-size:13px;">Toque de Glamour - tienda de cosmeticos y cuidado personal.</p>
        </div>
      </div>
    </div>
  `;
}

export class OrderMailService {
  static async enviarConfirmacion(pedido) {
    return this.enviarConPdf(pedido, false);
  }

  static async enviarCompletado(pedido) {
    return this.enviarConPdf(pedido, true);
  }

  static async enviarConPdf(pedido, completado) {
    try {
      const pdfPath = await InvoiceService.generateInvoicePDF(pedido);
      const codigo = pedido.codigo || pedido.id;
      await transporter.sendMail({
        from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
        to: pedido.correoCliente || pedido.cliente.correo,
        subject: `${completado ? 'Pedido completado' : 'Comprobante de pedido'} ${codigo} - Toque de Glamour`,
        html: emailHtml(pedido, completado),
        attachments: [{
          filename: `Comprobante_${codigo}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        }]
      });
    } catch (error) {
      console.error('Error enviando confirmacion de pedido:', error.message);
    }
  }
}
