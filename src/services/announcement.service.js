import prisma from '../config/db.js';
import { transporter } from './client-auth.service.js';

const clean = (value) => String(value || '').trim();
const escapeHtml = (value) => clean(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function htmlMensaje(nombre, asunto, mensaje) {
  const cuerpo = escapeHtml(mensaje).replace(/\n/g, '<br>');
  return `
    <div style="font-family:Arial,sans-serif;background:#fff6fa;padding:28px;color:#321a25;">
      <div style="max-width:660px;margin:auto;background:#fff;border:1px solid #ead2dc;border-radius:14px;overflow:hidden;">
        <div style="background:#7b2446;color:#fff;padding:26px 30px;">
          <h1 style="margin:0;font-size:25px;">Toque de Glamour</h1>
          <p style="margin:8px 0 0;color:#ffd6e3;">${escapeHtml(asunto)}</p>
        </div>
        <div style="padding:28px 30px;line-height:1.65;">
          <p>Hola <strong>${escapeHtml(nombre || 'cliente')}</strong>,</p>
          <p>${cuerpo}</p>
          <p style="color:#7d6470;font-size:13px;">
            Recibes este correo porque aceptaste promociones de Toque de Glamour.
            Puedes desactivarlas desde Configuraciones en tu perfil.
          </p>
        </div>
      </div>
    </div>
  `;
}

export class AnnouncementService {
  static async resumen() {
    const [suscritos, verificados] = await Promise.all([
      prisma.cliente.count({ where: { aceptaPromociones: true } }),
      prisma.cliente.count({ where: { aceptaPromociones: true, cuentaVerificada: true } })
    ]);
    return { suscritos, verificados };
  }

  static async enviar(data) {
    const asunto = clean(data.asunto);
    const mensaje = clean(data.mensaje);
    if (asunto.length < 4) throw new Error('Escribe un asunto mas claro.');
    if (mensaje.length < 10) throw new Error('Escribe un mensaje mas completo.');

    const clientes = await prisma.cliente.findMany({
      where: { aceptaPromociones: true, cuentaVerificada: true },
      select: { correo: true, nombre: true }
    });
    if (!clientes.length) throw new Error('No hay clientes verificados suscritos a promociones.');

    let enviados = 0;
    let fallidos = 0;
    for (const cliente of clientes) {
      try {
        await transporter.sendMail({
          from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
          to: cliente.correo,
          subject: `${asunto} - Toque de Glamour`,
          html: htmlMensaje(cliente.nombre, asunto, mensaje)
        });
        enviados += 1;
      } catch (error) {
        console.error(`No se pudo enviar anuncio a ${cliente.correo}:`, error.message);
        fallidos += 1;
      }
    }
    return { enviados, fallidos, total: clientes.length };
  }
}
