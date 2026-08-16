import { roundMoney } from '../utils/money.js';
import { invoiceBrand as brand, moneyPdf } from './invoice-format.service.js';
import { originalSubtotal } from './order-pricing.service.js';

const discountTotal = (order) => roundMoney(order.descuentoProducto)
  + roundMoney(order.descuentoBienvenida);

export class InvoiceTotalsRenderer {
  static render(doc, order) {
    const x = 332;
    const y = doc.y;
    const discounts = discountTotal(order);
    const rows = [
      ['Subtotal original', originalSubtotal(order)],
      ...(discounts > 0 ? [['Descuentos', -discounts]] : []),
      ['Subtotal', order.subtotal],
      ['Envío', order.costoEnvio || 0],
      ...(Number(order.ivaIncluido) > 0 ? [['IVA incluido', order.ivaIncluido]] : [])
    ];
    const height = 54 + rows.length * 20;
    doc.roundedRect(x, y, 220, height, 8).fillAndStroke(brand.rose, brand.line);
    rows.forEach(([label, value], index) => this.line(doc, x, y + 14 + index * 20, label, value));
    const lineY = y + 20 + rows.length * 20;
    doc.moveTo(x + 14, lineY).lineTo(x + 206, lineY).strokeColor(brand.line).stroke();
    doc.fillColor(brand.wineDark).font('Helvetica-Bold').fontSize(12);
    doc.text('Total', x + 14, lineY + 10, { width: 70 });
    doc.text(moneyPdf(order.total), x + 102, lineY + 10, { width: 104, align: 'right' });
  }

  static line(doc, x, y, label, value) {
    doc.fillColor(brand.muted).font('Helvetica').fontSize(9.5).text(label, x + 14, y, { width: 90 });
    doc.fillColor(brand.ink).font('Helvetica-Bold')
      .text(moneyPdf(value), x + 102, y, { width: 104, align: 'right' });
  }
}
