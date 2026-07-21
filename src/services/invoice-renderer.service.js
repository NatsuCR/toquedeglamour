import fs from 'fs';
import path from 'path';
import { clienteNombre, invoiceBrand as brand, labelEntrega, labelPago, moneyPdf } from './invoice-format.service.js';
import { roundMoney } from '../utils/money.js';
import { formatWeight } from './shipping.service.js';
export class InvoiceRenderer {
  static render(doc, pedido) {
    this.header(doc, pedido);
    this.infoCards(doc, pedido);
    this.itemsTable(doc, pedido);
    this.totals(doc, pedido);
    this.footer(doc);
  }
  static header(doc, pedido) {
    const logo = path.join(process.cwd(), 'public', 'img', 'toque-de-glamour.png');
    doc.roundedRect(34, 34, 527, 94, 10).fill(brand.rose);
    if (fs.existsSync(logo)) doc.image(logo, 50, 48, { fit: [90, 54] });
    doc.fillColor(brand.wine).font('Helvetica-Bold').fontSize(23).text('Toque de Glamour', 150, 50);
    doc.fillColor(brand.muted).font('Helvetica').fontSize(10).text('Comprobante de pedido', 150, 80);
    doc.fillColor(brand.gold).font('Helvetica-Bold').fontSize(10)
      .text(`CODIGO ${pedido.codigo || pedido.id}`, 390, 54, { width: 145, align: 'right' });
    doc.fillColor(brand.muted).font('Helvetica').fontSize(9)
      .text(`Emitido: ${pedido.creadoEn.toLocaleDateString('es-CR')}`, 390, 78, { width: 145, align: 'right' });
  }
  static infoCards(doc, pedido) {
    const y = 150;
    this.card(doc, 44, y, 240, 115, 'Cliente', [
      clienteNombre(pedido),
      pedido.correoCliente || pedido.cliente.correo,
      `Cedula: ${pedido.cedulaCliente || pedido.cliente.cedula}`,
      `Celular: ${pedido.celular1Cliente || pedido.cliente.celular1}`,
      `Peso: ${formatWeight(pedido.pesoTotalGramos || 0)}`
    ]);
    const entrega = this.entregaLines(pedido);
    this.card(doc, 312, y, 240, 115, 'Entrega', entrega);
    this.card(doc, 44, y + 132, 240, 88, 'Pago', [
      labelPago[pedido.metodoPago] || pedido.metodoPago,
      pedido.canalComprobante === 'WHATSAPP' ? 'Comprobante por WhatsApp' : 'Comprobante adjunto en web'
    ]);
    this.card(doc, 312, y + 132, 240, 88, 'Estado', [
      'Pendiente de verificacion',
      'Fase: Preparacion del pedido'
    ]);
  }

  static entregaLines(pedido) {
    if (pedido.tipoEntrega !== 'DOMICILIO' || !pedido.direccionEnvio) {
      return [labelEntrega[pedido.tipoEntrega] || 'Retiro en local', 'Sin costo adicional de envio'];
    }
    return [
      labelEntrega[pedido.tipoEntrega],
      pedido.direccionEnvio.zonaEntrega || 'Resto del pa\u00eds',
      `${pedido.direccionEnvio.provincia}, ${pedido.direccionEnvio.canton}`,
      pedido.direccionEnvio.distrito,
      pedido.direccionEnvio.direccionExacta,
      pedido.direccionEnvio.descripcionCasa
    ];
  }

  static card(doc, x, y, w, h, title, lines) {
    doc.roundedRect(x, y, w, h, 8).fillAndStroke('#ffffff', brand.line);
    doc.fillColor(brand.wine).font('Helvetica-Bold').fontSize(11).text(title, x + 14, y + 12);
    doc.fillColor(brand.ink).font('Helvetica').fontSize(9.5);
    lines.filter(Boolean).slice(0, 5).forEach((line, index) => {
      doc.text(String(line), x + 14, y + 34 + index * 15, { width: w - 28, ellipsis: true });
    });
  }

  static itemsTable(doc, pedido) {
    const startY = 430;
    const cols = { product: 44, qty: 310, unit: 370, sub: 465 };
    doc.fillColor(brand.wineDark).font('Helvetica-Bold').fontSize(14).text('Detalle de productos', 44, 396);
    doc.roundedRect(44, startY, 508, 28, 7).fill(brand.wine);
    doc.fillColor('#ffffff').fontSize(9).text('Producto', cols.product + 12, startY + 10, { width: 245 });
    doc.text('Cant.', cols.qty, startY + 10, { width: 45, align: 'center' });
    doc.text('Unitario', cols.unit, startY + 10, { width: 75, align: 'right' });
    doc.text('Subtotal', cols.sub, startY + 10, { width: 75, align: 'right' });
    let y = startY + 38;
    pedido.items.forEach((item, index) => {
      const subtotal = Number(item.cantidad) * roundMoney(item.precioUnitario);
      if (index % 2 === 0) doc.rect(44, y - 8, 508, 28).fill('#fff8fb');
      doc.fillColor(brand.ink).font('Helvetica').fontSize(9.5);
      doc.text(item.producto.nombre, cols.product + 12, y, { width: 245, ellipsis: true });
      doc.text(String(item.cantidad), cols.qty, y, { width: 45, align: 'center' });
      doc.text(moneyPdf(item.precioUnitario), cols.unit, y, { width: 75, align: 'right' });
      doc.text(moneyPdf(subtotal), cols.sub, y, { width: 75, align: 'right' });
      y += 28;
    });
    doc.moveTo(44, y).lineTo(552, y).strokeColor(brand.line).stroke();
    doc.y = y + 18;
  }

  static totals(doc, pedido) {
    const x = 352;
    const y = doc.y;
    const subtotal = Number(pedido.subtotal || pedido.total) - Number(pedido.costoEnvio || 0);
    const iva = Math.max(0, roundMoney(pedido.total) - roundMoney(pedido.subtotal) - roundMoney(pedido.costoEnvio || 0));
    doc.roundedRect(x, y, 200, iva > 0 ? 112 : 92, 8).fillAndStroke(brand.rose, brand.line);
    this.totalLine(doc, x, y + 14, 'Subtotal', moneyPdf(subtotal));
    this.totalLine(doc, x, y + 34, 'Envio', moneyPdf(pedido.costoEnvio || 0));
    if (iva > 0) this.totalLine(doc, x, y + 54, 'IVA', moneyPdf(iva));
    const lineY = iva > 0 ? y + 78 : y + 58;
    doc.moveTo(x + 14, lineY).lineTo(x + 186, lineY).strokeColor(brand.line).stroke();
    doc.fillColor(brand.wineDark).font('Helvetica-Bold').fontSize(12);
    doc.text('Total', x + 14, lineY + 10, { width: 70 });
    doc.text(moneyPdf(pedido.total), x + 92, lineY + 10, { width: 94, align: 'right' });
  }

  static totalLine(doc, x, y, label, value) {
    doc.fillColor(brand.muted).font('Helvetica').fontSize(9.5).text(label, x + 14, y, { width: 70 });
    doc.fillColor(brand.ink).font('Helvetica-Bold').text(value, x + 92, y, { width: 94, align: 'right' });
  }

  static footer(doc) {
    doc.fillColor(brand.muted).font('Helvetica').fontSize(9).text('Gracias por preferir Toque de Glamour. Conserva este comprobante para seguimiento de tu pedido.', 44, 745, {
      width: 508, align: 'center'
    });
  }
}
