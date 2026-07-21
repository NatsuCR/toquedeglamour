import { AnnouncementService } from '../services/announcement.service.js';

function flash(req) {
  const data = req.session.announcementFlash || null;
  delete req.session.announcementFlash;
  return data;
}

function setFlash(req, type, message) {
  req.session.announcementFlash = { type, message };
}

export class AnnouncementController {
  static async render(req, res) {
    try {
      const resumen = await AnnouncementService.resumen();
      res.render('admin/anuncios', { admin: res.locals.admin, resumen, flashMsg: flash(req) });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar anuncios.');
    }
  }

  static async enviar(req, res) {
    try {
      const result = await AnnouncementService.enviar(req.body);
      setFlash(req, 'ok', `Anuncio enviado a ${result.enviados} clientes. Fallidos: ${result.fallidos}.`);
    } catch (error) {
      console.error(error);
      setFlash(req, 'error', error.message || 'No se pudo enviar el anuncio.');
    }
    res.redirect('/admin/correos');
  }
}
