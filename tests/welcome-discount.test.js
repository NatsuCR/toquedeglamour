import test from 'node:test';
import assert from 'node:assert/strict';
import { WelcomeDiscountService } from '../src/services/welcome-discount.service.js';

test('recupera el uso histórico del descuento de bienvenida', async () => {
  const usedAt = new Date('2026-08-15T12:00:00Z');
  let updated;
  const db = {
    pedido: { findFirst: async () => ({ creadoEn: usedAt }) },
    cliente: { update: async (query) => { updated = query; } }
  };
  const client = await WelcomeDiscountService.clientWithUsage(db, {
    id: 18,
    bienvenidaUsadaEn: null
  });
  assert.equal(client.bienvenidaUsadaEn, usedAt);
  assert.equal(updated.data.bienvenidaUsadaEn, usedAt);
});

test('impide consumir el descuento por segunda vez', async () => {
  const db = { cliente: { updateMany: async () => ({ count: 0 }) } };
  await assert.rejects(
    WelcomeDiscountService.consume(db, 18),
    /ya fue utilizado/
  );
});
