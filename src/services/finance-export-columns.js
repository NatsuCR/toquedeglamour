const col = ([header, key, width]) => ({ header, key, width });

export const SUMMARY_COLUMNS = [
  { header: 'Indicador', key: 'indicador', width: 36 },
  { header: 'Valor', key: 'valor', width: 20 },
  { header: 'Tipo', key: 'tipo', width: 16 }
];

export const SALES_COLUMNS = [
  ['Codigo interno', 'codigo', 24], ['Fecha y hora', 'fecha', 20],
  ['Tipo de registro', 'fuente', 18], ['Estado', 'estado', 20],
  ['Receptor / cliente', 'cliente', 28], ['Identificacion', 'identificacion', 16],
  ['Correo', 'correo', 30], ['Medio de pago', 'medioPago', 18],
  ['Subtotal productos', 'subtotalProductos', 18], ['Envio', 'envio', 14],
  ['IVA', 'iva', 14], ['Total', 'total', 18],
  ['Costo productos', 'costos', 16], ['Comision empleado', 'comision', 18],
  ['Resultado neto', 'neto', 18], ['Responsable', 'responsable', 30],
  ['Notas internas', 'notas', 36], ['Comprobantes', 'comprobantes', 42],
  ['Base sin IVA', 'baseSinIva', 18], ['Condicion de venta', 'condicion', 18],
  ['Moneda', 'moneda', 10], ['Tipo comprobante', 'tipoComprobante', 20],
  ['Clave Hacienda', 'claveHacienda', 28],
  ['Consecutivo Hacienda', 'consecutivoHacienda', 24],
  ['Actividad economica', 'actividadEconomica', 22]
].map(col);

export const DETAIL_COLUMNS = [
  ['Codigo interno', 'codigo', 24], ['Origen', 'fuente', 18],
  ['Linea', 'linea', 9], ['SKU', 'sku', 14], ['Producto', 'producto', 34],
  ['Marca', 'marca', 20], ['Categoria', 'categoria', 20],
  ['Cantidad', 'cantidad', 12], ['Unidad', 'unidad', 10],
  ['Precio unitario', 'precioUnitario', 18], ['Costo unitario', 'costoUnitario', 18],
  ['Subtotal', 'subtotal', 16], ['Tarifa IVA', 'tarifaIva', 14],
  ['IVA', 'iva', 14], ['Total linea', 'totalLinea', 18],
  ['Costo total', 'costoTotal', 16]
].map(col);

export const EXPENSE_COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 18 },
  { header: 'Categoria', key: 'categoria', width: 22 },
  { header: 'Descripcion', key: 'descripcion', width: 48 },
  { header: 'Monto', key: 'monto', width: 18 },
  { header: 'Comprobante', key: 'comprobante', width: 42 }
];

export const LOSS_COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 20 },
  { header: 'SKU', key: 'sku', width: 14 },
  { header: 'Producto', key: 'producto', width: 34 },
  { header: 'Cantidad', key: 'cantidad', width: 12 },
  { header: 'Costo unitario', key: 'costoUnitario', width: 18 },
  { header: 'Perdida total', key: 'montoPerdida', width: 18 },
  { header: 'Motivo', key: 'motivo', width: 52 },
  { header: 'Registrado por', key: 'responsable', width: 30 }
];
