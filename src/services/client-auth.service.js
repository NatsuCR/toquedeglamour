import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import prisma from '../config/db.js';
import { buildTermsConsent } from './legal-consent.service.js';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user',
    pass: process.env.SMTP_PASS || 'ethereal.pass'
  }
});

function publicClient(cliente) {
  const { passwordHash, codigoVerificacion, codigoExpiracion, codigoRecuperacion, recuperacionExpira, ...seguro } = cliente;
  return seguro;
}

function normalizeClient(data) {
  return {
    correo: data.correo.trim().toLowerCase(),
    nombre: data.nombre.trim(),
    apellidos: data.apellidos.trim(),
    cedula: data.cedula.trim(),
    celular1: data.celular1.trim(),
    celular2: data.celular2 ? data.celular2.trim() : null
  };
}

export class ClientAuthService {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async registerClient(data) {
    const cliente = normalizeClient(data);
    const consentimiento = buildTermsConsent(data.aceptoTerminos);
    const existe = await prisma.cliente.findFirst({
      where: { OR: [{ correo: cliente.correo }, { cedula: cliente.cedula }] }
    });

    if (existe) {
      throw new Error('El correo o la cédula ya están registrados en el sistema.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const codigoVerificacion = this.generateOTP();
    const codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000);
    const nuevoCliente = await prisma.cliente.create({
      data: {
        ...cliente,
        ...consentimiento,
        passwordHash,
        codigoVerificacion,
        codigoExpiracion
      }
    });

    this.sendVerificationEmail(nuevoCliente.correo, nuevoCliente.nombre, codigoVerificacion)
      .catch((err) => console.error('Error enviando correo OTP:', err));

    return publicClient(nuevoCliente);
  }

  static async loginClient(correo, password) {
    if (!correo || !password) throw new Error('Correo y contraseña son requeridos.');

    const cliente = await prisma.cliente.findUnique({
      where: { correo: correo.trim().toLowerCase() }
    });

    if (!cliente) return null;
    const isValid = await bcrypt.compare(password, cliente.passwordHash);
    return isValid ? publicClient(cliente) : null;
  }

  static async verifyOTP(clienteId, otpIngresado) {
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new Error('Cliente no encontrado.');
    if (cliente.cuentaVerificada) return true;
    if (cliente.codigoVerificacion !== otpIngresado) {
      throw new Error('El código ingresado es incorrecto.');
    }
    if (new Date() > cliente.codigoExpiracion) {
      throw new Error('El código ha expirado. Por favor solicita uno nuevo.');
    }

    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        cuentaVerificada: true,
        codigoVerificacion: null,
        codigoExpiracion: null
      }
    });
    return true;
  }

  static async sendVerificationEmail(destino, nombre, otp) {
    const info = await transporter.sendMail({
      from: `"Toque de Glamour" <${process.env.SMTP_USER || 'no-reply@toquedeglamour.com'}>`,
      to: destino,
      subject: 'Verifica tu cuenta - Toque de Glamour',
      html: `
        <h2>¡Hola ${nombre}!</h2>
        <p>Gracias por registrarte en Toque de Glamour.</p>
        <p>Ingresa este código de verificación para activar tu cuenta:</p>
        <h3 style="background:#FBEAF0;color:#993556;padding:10px;text-align:center;letter-spacing:5px;">${otp}</h3>
        <p>Este código expirará en 15 minutos.</p>
      `
    });
    console.log(`Correo de verificación enviado a ${destino} (${info.messageId})`);
  }
}
