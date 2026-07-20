import { transporter } from './client-auth.service.js';

function ticketHtml(ticket) {
  const cliente = ticket.cliente;
  return `
    <div style="font-family:Arial,sans-serif;background:#fff6fa;padding:28px;color:#321a25;">
      <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #ead2dc;border-radius:12px;overflow:hidden;">
        <div style="background:#7b2446;color:#fff;padding:24px 28px;">
          <h1 style="margin:0;font-size:24px;">Toque de Glamour</h1>
          <p style="margin:8px 0 0;color:#ffd6e3;">Recibimos tu ticket de soporte</p>
        </div>
        <div style="padding:26px 28px;">
          <p>Hola <strong>${cliente.nombre}</strong>, gracias por escribirnos.</p>
          <p>Hemos recibido tu solicitud y pronto un administrador se comunicara contigo desde el hilo del ticket.</p>
          <div style="border:1px solid #ead2dc;border-radius:10px;padding:16px;margin:20px 0;background:#fff8fb;">
            <p style="margin:0 0 8px;"><strong>Ticket:</strong> #${ticket.id}</p>
            <p style="margin:0;"><strong>Asunto:</strong> ${ticket.asunto}</p>
          </div>
          <p>Puedes revisar el avance desde tu cuenta, en la seccion de soporte.</p>
          <p style="color:#7d6470;font-size:13px;">Toque de Glamour - soporte al cliente.</p>
        </div>
      </div>
    </div>
  `;
}

export class SupportMailService {
  static async enviarConfirmacion(ticket) {
    try {
      await transporter.sendMail({
        from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
        to: ticket.cliente.correo,
        subject: `Recibimos tu ticket #${ticket.id} - Toque de Glamour`,
        html: ticketHtml(ticket)
      });
    } catch (error) {
      console.error('Error enviando confirmacion de soporte:', error.message);
    }
  }

  static async enviarCierre(ticket) {
    try {
      await transporter.sendMail({
        from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
        to: ticket.cliente.correo,
        subject: `Ticket #${ticket.id} cerrado - Toque de Glamour`,
        html: `
          <div style="font-family:Arial,sans-serif;background:#fff6fa;padding:28px;color:#321a25;">
            <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #ead2dc;border-radius:12px;overflow:hidden;">
              <div style="background:#7b2446;color:#fff;padding:24px 28px;">
                <h1 style="margin:0;font-size:24px;">Toque de Glamour</h1>
                <p style="margin:8px 0 0;color:#ffd6e3;">Ticket #${ticket.id} cerrado</p>
              </div>
              <div style="padding:26px 28px;">
                <p>Hola <strong>${ticket.cliente.nombre}</strong>, gracias por usar nuestro sistema de soporte.</p>
                <p>El ticket <strong>${ticket.asunto}</strong> fue cerrado. Si tienes mas consultas, puedes abrir un ticket nuevo cuando lo necesites.</p>
              </div>
            </div>
          </div>`
      });
    } catch (error) {
      console.error('Error enviando cierre de soporte:', error.message);
    }
  }
}
