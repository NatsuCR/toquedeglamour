import prisma from '../config/db.js';
import { FREE_SHIPPING_THRESHOLD } from '../config/promotion-policy.constants.js';

const KEYS = {
  bienvenidaActiva: 'promocion_bienvenida_activa',
  envioGratisActivo: 'promocion_envio_gratis_activo'
};

const DEFAULTS = {
  bienvenidaActiva: true,
  envioGratisActivo: true,
  bienvenidaPorcentaje: 5,
  envioGratisDesde: FREE_SHIPPING_THRESHOLD
};

const enabled = (value) => value === undefined || ['true', '1', 'on'].includes(String(value));

export class PromotionSettingsService {
  static async get(db = prisma) {
    const rows = await db.ajusteSitio.findMany({
      where: { clave: { in: Object.values(KEYS) } }
    });
    const saved = Object.fromEntries(rows.map((row) => [row.clave, row.valor]));
    return {
      ...DEFAULTS,
      bienvenidaActiva: enabled(saved[KEYS.bienvenidaActiva]),
      envioGratisActivo: enabled(saved[KEYS.envioGratisActivo])
    };
  }

  static async update(data) {
    const values = {
      bienvenidaActiva: data.bienvenidaActiva === 'on',
      envioGratisActivo: data.envioGratisActivo === 'on'
    };
    await Promise.all(Object.entries(values).map(([name, value]) => {
      const clave = KEYS[name];
      return prisma.ajusteSitio.upsert({
        where: { clave }, update: { valor: String(value) },
        create: { clave, valor: String(value) }
      });
    }));
    return this.get();
  }
}
