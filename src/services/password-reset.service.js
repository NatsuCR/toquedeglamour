import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { transporter } from './client-auth.service.js';

const clean = (value) => String(value || '').trim();
const email = (value) => clean(value).toLowerCase();
const code = () => Math.floor(100000 + Math.random() * 900000).toString();

async function sendResetEmail(cliente, codigo) {
  const info = await transporter.sendMail({
    from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
    to: cliente.correo,
    subject: 'Codigo para cambiar tu contrasena - Toque de Glamour',
    html: `
      <div style="font-family:Arial,sans-serif;color:#321a25;">
        <h2>Hola ${cliente.nombre}</h2>
        <p>Recibimos una solicitud para cambiar tu contrasena.</p>
        <h3 style="background:#fff1f6;color:#7b2446;padding:12px;text-align:center;letter-spacing:5px;">${codigo}</h3>
        <p>El codigo vence en 15 minutos. Si no fuiste tu, ignora este correo.</p>
      </div>
    `
  });
  console.log(`Correo de recuperacion enviado a ${cliente.correo} (${info.messageId})`);
}

export class PasswordResetService {
  static async solicitar(correoRaw) {
    const correo = email(correoRaw);
    if (!correo) throw new Error('El correo es requerido.');
    const cliente = await prisma.cliente.findUnique({ where: { correo } });
    if (!cliente) throw new Error('No existe una cuenta registrada con ese correo.');
    const codigo = code();
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        codigoRecuperacion: codigo,
        recuperacionExpira: new Date(Date.now() + 15 * 60 * 1000)
      }
    });
    await sendResetEmail(cliente, codigo);
    return { correo };
  }

  static async restablecer(correoRaw, codigoRaw, passwordRaw) {
    const correo = email(correoRaw);
    const cliente = await prisma.cliente.findUnique({ where: { correo } });
    if (!cliente?.codigoRecuperacion) throw new Error('Solicita un codigo nuevo.');
    if (clean(codigoRaw) !== cliente.codigoRecuperacion) throw new Error('Codigo incorrecto.');
    if (new Date() > cliente.recuperacionExpira) throw new Error('El codigo vencio.');
    if (clean(passwordRaw).length < 6) throw new Error('La contrasena debe tener al menos 6 caracteres.');
    const passwordHash = await bcrypt.hash(clean(passwordRaw), 12);
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: { passwordHash, codigoRecuperacion: null, recuperacionExpira: null }
    });
  }
}
