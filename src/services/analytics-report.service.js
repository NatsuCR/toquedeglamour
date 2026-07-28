import prisma from '../config/db.js';

function sortGroups(groups, limit = 30) {
  return groups
    .map((item) => ({ ...item, total: item._count._all }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export class AnalyticsReportService {
  static async summary() {
    const [visits, visitors, publicVisitGroups, pageViews, clicks, pages, clickGroups] =
      await Promise.all([
        prisma.visitaSitio.count(),
        prisma.visitaSitio.groupBy({ by: ['visitanteId'] }),
        prisma.eventoAnalitica.groupBy({
          by: ['visitaId'],
          where: { tipo: 'PAGINA' }
        }),
        prisma.eventoAnalitica.count({
          where: { tipo: 'PAGINA' }
        }),
        prisma.eventoAnalitica.count({
          where: { tipo: 'CLIC' }
        }),
        prisma.eventoAnalitica.groupBy({
          by: ['ruta'],
          where: { tipo: 'PAGINA' },
          _count: { _all: true }
        }),
        prisma.eventoAnalitica.groupBy({
          by: ['etiqueta', 'destino'],
          where: { tipo: 'CLIC' },
          _count: { _all: true }
        })
      ]);

    return {
      visits,
      uniqueVisitors: visitors.length,
      publicVisits: publicVisitGroups.length,
      pageViews,
      clicks,
      topPages: sortGroups(pages),
      topClicks: sortGroups(clickGroups)
    };
  }
}
