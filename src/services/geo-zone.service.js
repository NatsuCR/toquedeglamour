import fs from 'fs';
import path from 'path';

const ZONA_RESTO = 'Resto del pa\u00eds';
const dataPath = path.resolve('public', 'data', 'costa-rica.json');
let cached = null;

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function locations() {
  if (!cached) cached = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return cached.provincias || [];
}

export function zonaEntregaPorUbicacion(provincia, canton) {
  const provinceKey = normalize(provincia);
  const cantonKey = normalize(canton);
  const province = locations().find((item) => normalize(item.nombre) === provinceKey);
  const county = province?.cantones?.find((item) => normalize(item.nombre) === cantonKey);
  return county?.zonaEntrega || ZONA_RESTO;
}
