import { PasswordResetService } from '../services/password-reset.service.js';

function flash(req) {
  const data = {
    error: req.session.passwordError || null,
    success: req.session.passwordSuccess || null
  };
  delete req.session.passwordError;
  delete req.session.passwordSuccess;
  return data;
}

export class PasswordResetController {
  static renderSolicitar(req, res) {
    res.render('client/password-forgot', { user: res.locals.cliente, ...flash(req) });
  }

  static async solicitar(req, res) {
    try {
      const result = await PasswordResetService.solicitar(req.body.correo);
      req.session.resetCorreo = result.correo;
      req.session.passwordSuccess = 'Si el correo existe, enviamos un codigo de recuperacion.';
      res.redirect('/password/restablecer');
    } catch (error) {
      req.session.passwordError = error.message;
      res.redirect('/password/olvido');
    }
  }

  static renderRestablecer(req, res) {
    if (!req.session.resetCorreo) return res.redirect('/password/olvido');
    res.render('client/password-reset', {
      user: res.locals.cliente,
      correo: req.session.resetCorreo,
      ...flash(req)
    });
  }

  static async restablecer(req, res) {
    try {
      const correo = req.body.correo || req.session.resetCorreo;
      await PasswordResetService.restablecer(correo, req.body.codigo, req.body.password);
      delete req.session.resetCorreo;
      res.redirect('/login?password=reset');
    } catch (error) {
      req.session.passwordError = error.message;
      res.redirect('/password/restablecer');
    }
  }
}
