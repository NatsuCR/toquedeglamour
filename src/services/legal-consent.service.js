export const TERMS_VERSION = '2026-07-03';

const acceptedValues = new Set(['on', 'true', '1', 'si', 'sí', 'yes']);

export function buildTermsConsent(value) {
  const normalized = String(value || '').trim().toLowerCase();
  const accepted = value === true || acceptedValues.has(normalized);

  if (!accepted) {
    throw new Error('Debes aceptar los términos y condiciones para crear tu cuenta.');
  }

  return {
    aceptoTerminos: true,
    terminosAceptadosEn: new Date(),
    versionTerminos: TERMS_VERSION
  };
}
