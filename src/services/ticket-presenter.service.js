function adjuntoPayload(adjunto) {
  return {
    id: adjunto.id,
    url: adjunto.rutaArchivo,
    nombre: adjunto.nombreOriginal,
    mimeType: adjunto.mimeType,
    esImagen: adjunto.mimeType?.startsWith('image/')
  };
}

function mensajePayload(mensaje) {
  return {
    id: mensaje.id,
    autor: mensaje.autor,
    mensaje: mensaje.mensaje,
    creadoEn: mensaje.creadoEn.toISOString(),
    adjuntos: (mensaje.adjuntos || []).map(adjuntoPayload)
  };
}

export function ticketPayload(ticket) {
  return {
    id: ticket.id,
    asunto: ticket.asunto,
    estado: ticket.estado,
    actualizadoEn: ticket.actualizadoEn.toISOString(),
    mensajes: ticket.mensajes.map(mensajePayload)
  };
}
