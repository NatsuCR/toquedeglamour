export const SUMMARY_COLUMNS = [
  { header: 'Indicador', key: 'indicador', width: 34 },
  { header: 'Monto (CRC)', key: 'monto', width: 20 }
];

export const SALES_COLUMNS = [
  ['Tipo de registro', 'fuente', 18],
  ['Tipo comprobante', 'tipoComprobante', 20],
  ['Clave Hacienda', 'claveHacienda', 52],
  ['Consecutivo Hacienda', 'consecutivoHacienda', 24],
  ['Actividad economica', 'actividadEconomica', 22],
  ['Codigo interno', 'codigo', 24],
  ['Fecha y hora', 'fecha', 20],
  ['Estado', 'estado', 20],
  ['Responsable', 'responsable', 30],
  ['Receptor / cliente', 'cliente', 28],
  ['Identificacion', 'identificacion', 16],
  ['Correo', 'correo', 30],
  ['Condicion de venta', 'condicion', 18],
  ['Medio de pago', 'medioPago', 18],
  ['Moneda', 'moneda', 10],
  ['Subtotal productos', 'subtotalProductos', 18],
  ['Envio', 'envio', 14],
  ['Base sin IVA', 'baseSinIva', 18],
  ['IVA', 'iva', 14],
  ['Total', 'total', 18],
  ['Costo productos', 'costos', 16],
  ['Comision empleado', 'comision', 18],
  ['Resultado neto', 'neto', 18],
  ['Notas internas', 'notas', 36],
  ['Comprobantes', 'comprobantes', 42]
].map(([header, key, width]) => ({ header, key, width }));

export const DETAIL_COLUMNS = [
  ['Codigo interno', 'codigo', 24], ['Origen', 'fuente', 18],
  ['Linea', 'linea', 9], ['SKU', 'sku', 14], ['Producto', 'producto', 34],
  ['Marca', 'marca', 20], ['Categoria', 'categoria', 20],
  ['Cantidad', 'cantidad', 12], ['Unidad', 'unidad', 10],
  ['Precio unitario', 'precioUnitario', 18], ['Subtotal', 'subtotal', 16],
  ['Tarifa IVA', 'tarifaIva', 14], ['IVA', 'iva', 14],
  ['Total linea', 'totalLinea', 18], ['Costo', 'costo', 16]
].map(([header, key, width]) => ({ header, key, width }));

export const EXPENSE_COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 18 },
  { header: 'Categoria', key: 'categoria', width: 22 },
  { header: 'Descripcion', key: 'descripcion', width: 56 },
  { header: 'Monto', key: 'monto', width: 18 },
  { header: 'Comprobante', key: 'comprobanteNombre', width: 34 }
];
