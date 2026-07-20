import { ClientAuthService } from '../services/client-auth.service.js';
import {
  consumeClientReturn,
  getClientReturn,
  setClientSession
} from '../services/client-session.service.js';

export class ClientAuthController {
  static renderLogin(req, res) {
    const errorMsg = req.session.loginError || null;
    const success = req.query.password ? 'Contrasena actualizada. Inicia sesion nuevamente.' : null;
    if (req.session.loginError) delete req.session.loginError;
    res.render('client/login', { error: errorMsg, success, user: res.locals.cliente });
  }

  static renderRegistro(req, res) {
    const errorMsg = req.session.registroError || null;
    if (req.session.registroError) delete req.session.registroError;
    res.render('client/registro', { error: errorMsg, user: res.locals.cliente });
  }

  static async processRegistro(req, res) {
    try {
      const nuevoCliente = await ClientAuthService.registerClient(req.body);
      const returnTo = getClientReturn(req);
      req.session.regenerate((err) => {
        if (err) throw err;
        setClientSession(req, nuevoCliente, returnTo);
        const destino = nuevoCliente.cuentaVerificada ? consumeClientReturn(req) : '/verificar';
        req.session.save(() => res.redirect(destino));
      });
    } catch (error) {
      req.session.registroError = error.message;
      res.redirect('/registro');
    }
  }

  static async processLogin(req, res) {
    const { correo, password } = req.body;
    try {
      const cliente = await ClientAuthService.loginClient(correo, password);
      if (!cliente) {
        req.session.loginError = 'Credenciales invalidas.';
        return res.redirect('/login');
      }
      const returnTo = getClientReturn(req);
      req.session.regenerate((err) => {
        if (err) throw err;
        setClientSession(req, cliente, returnTo);
        req.session.save(() => {
          if (!cliente.cuentaVerificada) return res.redirect('/verificar');
          res.redirect(consumeClientReturn(req));
        });
      });
    } catch (error) {
      req.session.loginError = 'Error inesperado.';
      res.redirect('/login');
    }
  }

  static renderVerificar(req, res) {
    const errorMsg = req.session.verifyError || null;
    if (req.session.verifyError) delete req.session.verifyError;
    if (!req.session?.clienteId) return res.redirect('/login');
    if (req.session.clienteVerificado) return res.redirect(consumeClientReturn(req));
    res.render('client/verificar', { error: errorMsg, user: res.locals.cliente });
  }

  static async processVerificar(req, res) {
    try {
      if (!req.session?.clienteId) return res.redirect('/login');
      await ClientAuthService.verifyOTP(req.session.clienteId, req.body.otp);
      req.session.clienteVerificado = true;
      const destino = consumeClientReturn(req);
      req.session.save(() => res.redirect(destino));
    } catch (error) {
      req.session.verifyError = error.message;
      res.redirect('/verificar');
    }
  }

  static logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('toquedeglamour_sid');
      res.redirect('/');
    });
  }
}
