const routeByView = {
  terminos: '/terminos-condiciones',
  privacidad: '/politica-privacidad',
  envios: '/politica-envios',
  cambios: '/cambios-devoluciones'
};

function renderLegal(res, view, title, metaDescription) {
  res.render(`client/legal/${view}`, {
    user: res.locals.cliente,
    title,
    canonical: routeByView[view],
    metaDescription
  });
}

export class LegalController {
  static terminos(req, res) {
    renderLegal(res, 'terminos', 'Términos y condiciones',
      'Términos de compra y uso de Toque de Glamour en Costa Rica.');
  }

  static privacidad(req, res) {
    renderLegal(res, 'privacidad', 'Política de privacidad',
      'Conoce cómo Toque de Glamour protege y utiliza tus datos personales.');
  }

  static envios(req, res) {
    renderLegal(res, 'envios', 'Política de envíos',
      'Información de envíos, Correos de Costa Rica y retiro local de Toque de Glamour.');
  }

  static cambios(req, res) {
    renderLegal(res, 'cambios', 'Cambios y devoluciones',
      'Política de cambios, devoluciones y cancelaciones de Toque de Glamour.');
  }
}
