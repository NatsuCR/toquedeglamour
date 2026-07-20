import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { InvoiceRenderer } from './invoice-renderer.service.js';

export class InvoiceService {
  static generateInvoicePDF(pedido) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 44, size: 'A4' });
        const facturasDir = path.join(process.cwd(), 'assets', 'facturas');
        if (!fs.existsSync(facturasDir)) fs.mkdirSync(facturasDir, { recursive: true });

        const fileName = `Pedido_${pedido.codigo || pedido.id}_${Date.now()}.pdf`;
        const filePath = path.join(facturasDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        InvoiceRenderer.render(doc, pedido);
        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}
