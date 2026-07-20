import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { transporter } from './client-auth.service.js';

const clean = (value) => String(value || '').trim();
const normalizeEmail = (value) => clean(value).toLowerCase();
const otp = () => Math.floor(100000 + Math.random() * 900000).toString();

async function sendEmailCode(correo, nombre, codigo) {
  await transporter.sendMail({
    from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
    to: correo,
    subject: 'Confirma tu nuevo correo - Toque de Glamour',
    html: `
      <div style="font-family:Arial,sans-serif;color:#321a25;">
        <h2>Hola ${nombre}</h2>
        <p>Usa este codigo para confirmar tu nuevo correo.</p>
        <h3 style="background:#fff1f6;color:#7b2446;padding:12px;text-align:center;letter-spacing:5px;">${codigo}</h3>
        <p>El codigo vence en 15 minutos.</p>
      </div>
    `
  });
}

export class ProfileSettingsService {
  static async actualizarCelulares(clienteId, data) {
    const celular1 = clean(data.celular1);
    if (!celular1) throw new Error('Celular 1 es requerido.');
    return prisma.cliente.update({
      where: { id: clienteId },
      data: { celular1, celular2: clean(data.celular2) || null }
    });
  }

  static async solicitarCorreo(clienteId, correoNuevo) {
    const correo = normalizeEmail(correoNuevo);
    if (!correo) throw new Error('El correo es requerido.');
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new Error('Cliente no encontrado.');
    if (correo === cliente.correo) throw new Error('Ese correo ya esta en tu cuenta.');
    const existe = await prisma.cliente.findUnique({ where: { correo } });
    if (existe) throw new Error('Ese correo ya esta registrado.');
    const codigo = otp();
    await sendEmailCode(correo, cliente.nombre, codigo);
    return { correo, codigo, expira: Date.now() + 15 * 60 * 1000 };
  }

  static async confirmarCorreo(clienteId, pendiente, codigoIngresado) {
    if (!pendiente?.correo || !pendiente?.codigo) throw new Error('Solicita un codigo primero.');
    if (Date.now() > Number(pendiente.expira)) throw new Error('El codigo vencio.');
    if (clean(codigoIngresado) !== pendiente.codigo) throw new Error('Codigo incorrecto.');
    const existe = await prisma.cliente.findFirst({
      where: { correo: pendiente.correo, NOT: { id: clienteId } }
    });
    if (existe) throw new Error('Ese correo ya esta registrado.');
    return prisma.cliente.update({
      where: { id: clienteId },
      data: { correo: pendiente.correo, cuentaVerificada: true }
    });
  }

  static async cambiarPassword(clienteId, actual, nueva) {
    if (clean(nueva).length < 6) throw new Error('La nueva contrasena debe tener al menos 6 caracteres.');
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new Error('Cliente no encontrado.');
    const ok = await bcrypt.compare(clean(actual), cliente.passwordHash);
    if (!ok) throw new Error('La contrasena actual no coincide.');
    const passwordHash = await bcrypt.hash(clean(nueva), 12);
    await prisma.cliente.update({ where: { id: clienteId }, data: { passwordHash } });
  }
}
