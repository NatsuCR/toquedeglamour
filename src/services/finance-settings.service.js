import prisma from '../config/db.js';

const KEYS = {
  ivaActivo: 'finanzas_iva_activo',
  ivaPorcentaje: 'finanzas_iva_porcentaje'
};

const defaults = {
  ivaActivo: true,
  ivaPorcentaje: 13
};

function boolValue(value) {
  return value === true || value === 'on' || value === 'true' || value === '1';
}

function rateValue(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return defaults.ivaPorcentaje;
  return parsed;
}

export class FinanceSettingsService {
  static async obtener() {
    const rows = await prisma.ajusteSitio.findMany({
      where: { clave: { in: Object.values(KEYS) } }
    });
    const map = Object.fromEntries(rows.map((row) => [row.clave, row.valor]));
    return {
      ivaActivo: boolValue(map[KEYS.ivaActivo]),
      ivaPorcentaje: rateValue(map[KEYS.ivaPorcentaje])
    };
  }

  static async actualizar(data) {
    const settings = {
      ivaActivo: boolValue(data.ivaActivo),
      ivaPorcentaje: rateValue(data.ivaPorcentaje)
    };
    await Promise.all([
      this.guardar(KEYS.ivaActivo, String(settings.ivaActivo)),
      this.guardar(KEYS.ivaPorcentaje, String(settings.ivaPorcentaje))
    ]);
    return settings;
  }

  static guardar(clave, valor) {
    return prisma.ajusteSitio.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor }
    });
  }
}
