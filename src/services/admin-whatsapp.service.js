import {
  pedidoWhatsappTexto,
  ticketWhatsappTexto
} from './admin-whatsapp-format.service.js';

function dividirTexto(texto, limite = 850) {
  const partes = [];
  let actual = '';

  texto.split('\n').forEach((linea) => {
    if ((actual + '\n' + linea).trim().length > limite) {
      if (actual.trim()) partes.push(actual.trim());
      actual = linea;
      return;
    }
    actual = `${actual}\n${linea}`.trim();
  });

  if (actual) partes.push(actual);
  return partes;
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function enviarParte(phone, apikey, texto) {
  const params = new URLSearchParams({ phone, text: texto, apikey });
  const response = await fetch(`https://api.callmebot.com/whatsapp.php?${params.toString()}`);
  if (!response.ok) throw new Error(`CallMeBot respondio ${response.status}.`);
}

async function enviarCallMeBot(texto) {
  const phone = process.env.CALLMEBOT_ADMIN_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) throw new Error('CallMeBot no esta configurado en .env.');

  const partes = dividirTexto(texto);
  for (const [index, parte] of partes.entries()) {
    const prefijo = partes.length > 1 ? `[${index + 1}/${partes.length}]\n` : '';
    await enviarParte(phone, apikey, `${prefijo}${parte}`);
    if (index < partes.length - 1) await esperar(900);
  }
  return true;
}

function puedeEnviar() {
  const enabled = process.env.CALLMEBOT_ENABLED === 'true';
  const provider = process.env.WHATSAPP_ADMIN_PROVIDER || 'callmebot';
  return enabled && provider === 'callmebot';
}

export async function notificarAdminWhatsapp(pedido) {
  if (!puedeEnviar()) return null;
  return enviarCallMeBot(pedidoWhatsappTexto(pedido));
}

export async function notificarTicketWhatsapp(ticket) {
  if (!puedeEnviar()) return null;
  return enviarCallMeBot(ticketWhatsappTexto(ticket));
}
