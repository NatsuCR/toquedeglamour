import prisma from '../config/db.js';

const PAYMENT_METHODS = new Set(['EFECTIVO', 'SINPE', 'TARJETA', 'TRANSFERENCIA', 'OTRO']);
const clean = (value) => String(value || '').trim();

function proofData(files = []) {
  return files.filter(Boolean).map((file) => ({
    ruta: `/uploads/ventas/${file.filename}`,
    nombre: file.originalname,
    mime: file.mimetype
  }));
}

function validateEmail(value) {
  const email = clean(value).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('El correo del cliente no es valido.');
  }
  return email || null;
}

export class SalesUpdateService {
  static async update(id, data, files = []) {
    const saleId = Number.parseInt(id, 10);
    if (!Number.isInteger(saleId)) throw new Error('Venta no valida.');
    const exists = await prisma.ventaPresencial.findUnique({ where: { id: saleId } });
    if (!exists) throw new Error('La venta presencial no existe.');
    const payment = PAYMENT_METHODS.has(data.metodoPago) ? data.metodoPago : exists.metodoPago;
    const proofs = proofData(files);

    return prisma.ventaPresencial.update({
      where: { id: saleId },
      data: {
        clienteNombre: clean(data.clienteNombre) || null,
        clienteCorreo: validateEmail(data.clienteCorreo),
        clienteCedula: clean(data.clienteCedula) || null,
        metodoPago: payment,
        notas: clean(data.notas) || null,
        adjuntos: proofs.length ? { create: proofs } : undefined
      },
      include: { vendedor: true, adjuntos: true, items: { include: { producto: true } } }
    });
  }
}
