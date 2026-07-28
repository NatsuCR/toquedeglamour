import prisma from '../config/db.js';

const clip = (value, size) => String(value || '').trim().slice(0, size);

export class AnalyticsRecordService {
  static async ensureVisit(visitorId, visitKey, isAdmin) {
    return prisma.visitaSitio.upsert({
      where: { sesionClave: visitKey },
      update: isAdmin ? { esAdministrativa: true } : {},
      create: {
        visitanteId: clip(visitorId, 64),
        sesionClave: clip(visitKey, 64),
        esAdministrativa: Boolean(isAdmin)
      }
    });
  }

  static async markAdmin(visitKey) {
    if (!visitKey) return;
    await prisma.visitaSitio.updateMany({
      where: { sesionClave: visitKey },
      data: { esAdministrativa: true }
    });
  }

  static async recordPage(visitId, route) {
    await prisma.eventoAnalitica.create({
      data: { visitaId: visitId, tipo: 'PAGINA', ruta: clip(route, 255) || '/' }
    });
  }

  static async recordClick(visitKey, payload) {
    const visit = await prisma.visitaSitio.findUnique({
      where: { sesionClave: visitKey },
      select: { id: true }
    });
    if (!visit) return false;

    await prisma.eventoAnalitica.create({
      data: {
        visitaId: visit.id,
        tipo: 'CLIC',
        ruta: clip(payload.ruta, 255) || '/',
        destino: clip(payload.destino, 255) || null,
        etiqueta: clip(payload.etiqueta, 160) || 'Elemento sin etiqueta'
      }
    });
    return true;
  }

  static async clearAll() {
    return prisma.$transaction([
      prisma.eventoAnalitica.deleteMany(),
      prisma.visitaSitio.deleteMany()
    ]);
  }
}
