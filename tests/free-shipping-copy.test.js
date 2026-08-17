import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import ejs from 'ejs';
import { formatMoneyCRC } from '../src/utils/money.js';
import { FREE_SHIPPING_THRESHOLD } from '../src/config/promotion-policy.constants.js';

const locals = {
  promotions: {
    bienvenidaActiva: false, envioGratisActivo: true,
    envioGratisDesde: FREE_SHIPPING_THRESHOLD
  },
  formatMoney: formatMoneyCRC
};

async function render(view) {
  return ejs.renderFile(path.resolve(view), locals);
}

test('muestra ₡40.000 en anuncios, políticas y administración', async () => {
  const views = [
    'src/views/client/partials/promotion-banners.ejs',
    'src/views/client/legal/promociones-vigentes.ejs',
    'src/views/admin/promociones-parts/settings.ejs'
  ];
  for (const view of views) {
    const html = await render(view);
    assert.match(html.replace(/\s/g, ''), /₡40[.,]?000/);
    assert.doesNotMatch(html.replace(/\s/g, ''), /₡35[.,]?000/);
  }
});
