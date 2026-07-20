import prisma from '../config/db.js';
import { ProfileSettingsService } from '../services/profile-settings.service.js';

function flash(req) {
  const data = {
    error: req.session.settingsError || null,
    success: req.session.settingsSuccess || null
  };
  delete req.session.settingsError;
  delete req.session.settingsSuccess;
  return data;
}

function pendingEmail(req) {
  return req.session.pendingClientEmail || null;
}

export class ProfileSettingsController {
  static async render(req, res) {
    const user = await prisma.cliente.findUnique({ where: { id: res.locals.cliente.id } });
    res.render('client/configuracion', { user, pendingEmail: pendingEmail(req), ...flash(req) });
  }

  static async celulares(req, res) {
    try {
      const user = await ProfileSettingsService.actualizarCelulares(res.locals.cliente.id, req.body);
      req.session.settingsSuccess = 'Tus celulares fueron actualizados.';
      req.session.clienteNombre = user.nombre;
    } catch (error) {
      req.session.settingsError = error.message;
    }
    res.redirect('/perfil/configuracion');
  }

  static async solicitarCorreo(req, res) {
    try {
      req.session.pendingClientEmail = await ProfileSettingsService.solicitarCorreo(
        res.locals.cliente.id,
        req.body.correo
      );
      req.session.settingsSuccess = 'Enviamos un codigo al nuevo correo.';
    } catch (error) {
      req.session.settingsError = error.message;
    }
    res.redirect('/perfil/configuracion');
  }

  static async confirmarCorreo(req, res) {
    try {
      const user = await ProfileSettingsService.confirmarCorreo(
        res.locals.cliente.id,
        pendingEmail(req),
        req.body.codigo
      );
      delete req.session.pendingClientEmail;
      req.session.clienteCorreo = user.correo;
      req.session.clienteVerificado = user.cuentaVerificada;
      req.session.settingsSuccess = 'Correo actualizado y verificado.';
    } catch (error) {
      req.session.settingsError = error.message;
    }
    res.redirect('/perfil/configuracion');
  }

  static async password(req, res) {
    try {
      await ProfileSettingsService.cambiarPassword(res.locals.cliente.id, req.body.actual, req.body.nueva);
      req.session.destroy(() => {
        res.clearCookie('toquedeglamour_sid');
        res.redirect('/login?password=updated');
      });
    } catch (error) {
      req.session.settingsError = error.message;
      res.redirect('/perfil/configuracion');
    }
  }
}
