import prisma from '../config/db.js';

const mensajesIncluidos = {
  orderBy: { creadoEn: 'asc' },
  include: { adjuntos: { orderBy: { creadoEn: 'asc' } } }
};

const includeTicket = { cliente: true, mensajes: mensajesIncluidos };

function texto(value, label) {
  const limpio = String(value || '').trim();
  if (!limpio) throw new Error(`${label} es requerido.`);
  return limpio;
}

function mensajeTexto(value, files = []) {
  const limpio = String(value || '').trim();
  if (!limpio && files.length === 0) throw new Error('Mensaje o archivo es requerido.');
  return limpio || 'Archivo adjunto.';
}

function adjuntos(files = []) {
  return files.map((file) => ({
    rutaArchivo: `/uploads/soporte/${file.filename}`,
    nombreOriginal: file.originalname,
    mimeType: file.mimetype,
    tamanoBytes: file.size
  }));
}

function mensajeCreate(ticketId, autor, mensaje, files) {
  const data = { autor, mensaje: mensajeTexto(mensaje, files) };
  if (ticketId) data.ticketId = ticketId;
  const archivos = adjuntos(files);
  if (archivos.length) data.adjuntos = { create: archivos };
  return data;
}

export class TicketService {
  static listarCliente(clienteId) {
    return prisma.ticketSoporte.findMany({
      where: { clienteId },
      include: { mensajes: mensajesIncluidos },
      orderBy: { actualizadoEn: 'desc' }
    });
  }

  static async obtenerCliente(ticketId, clienteId) {
    const ticket = await prisma.ticketSoporte.findFirst({
      where: { id: ticketId, clienteId },
      include: includeTicket
    });
    if (!ticket) throw new Error('Ticket no encontrado.');
    return ticket;
  }

  static crear(clienteId, data, files = []) {
    return prisma.ticketSoporte.create({
      data: {
        clienteId,
        asunto: texto(data.asunto, 'Asunto'),
        mensajes: { create: mensajeCreate(undefined, 'CLIENTE', data.mensaje, files) }
      },
      include: includeTicket
    });
  }

  static async responderCliente(ticketId, clienteId, mensaje, files = []) {
    const ticket = await this.obtenerCliente(ticketId, clienteId);
    if (ticket.estado === 'CERRADO') throw new Error('El ticket ya esta cerrado.');
    return this.agregarMensaje(ticket.id, 'CLIENTE', mensaje, files);
  }

  static listarAdmin() {
    return prisma.ticketSoporte.findMany({
      include: { cliente: true, mensajes: mensajesIncluidos },
      orderBy: { actualizadoEn: 'desc' }
    });
  }

  static async obtenerAdmin(ticketId) {
    const ticket = await prisma.ticketSoporte.findUnique({
      where: { id: ticketId },
      include: includeTicket
    });
    if (!ticket) throw new Error('Ticket no encontrado.');
    return ticket;
  }

  static async responderAdmin(ticketId, mensaje, files = []) {
    const ticket = await this.obtenerAdmin(ticketId);
    if (ticket.estado === 'CERRADO') throw new Error('El ticket ya esta cerrado.');
    return this.agregarMensaje(ticket.id, 'ADMIN', mensaje, files);
  }

  static cerrar(ticketId) {
    return prisma.ticketSoporte.update({
      where: { id: ticketId },
      data: { estado: 'CERRADO' }
    });
  }

  static async agregarMensaje(ticketId, autor, mensaje, files = []) {
    const [creado] = await prisma.$transaction([
      prisma.mensajeTicket.create({
        data: mensajeCreate(ticketId, autor, mensaje, files),
        include: { adjuntos: true }
      }),
      prisma.ticketSoporte.update({
        where: { id: ticketId },
        data: { estado: 'ABIERTO' }
      })
    ]);
    return creado;
  }
}
