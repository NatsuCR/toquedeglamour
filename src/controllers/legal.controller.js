function renderLegal(res, view, title) {
  res.render(`client/legal/${view}`, {
    user: res.locals.cliente,
    title
  });
}

export class LegalController {
  static terminos(req, res) {
    renderLegal(res, 'terminos', 'Términos y condiciones');
  }

  static privacidad(req, res) {
    renderLegal(res, 'privacidad', 'Política de privacidad');
  }

  static envios(req, res) {
    renderLegal(res, 'envios', 'Política de envíos');
  }

  static cambios(req, res) {
    renderLegal(res, 'cambios', 'Cambios y devoluciones');
  }
}
