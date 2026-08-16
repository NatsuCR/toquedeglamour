export async function syncProductFaqs(tx, productId, entries = []) {
  const current = await tx.preguntaFrecuente.findMany({
    where: { productoId: productId },
    select: { id: true }
  });
  const allowedIds = new Set(current.map(({ id }) => id));
  const retainedIds = entries.filter(({ id }) => id).map(({ id }) => id);

  entries.forEach(({ id }) => {
    if (id && !allowedIds.has(id)) {
      throw new Error('Una pregunta frecuente no pertenece a este producto.');
    }
  });

  await tx.preguntaFrecuente.deleteMany({
    where: {
      productoId: productId,
      ...(retainedIds.length ? { id: { notIn: retainedIds } } : {})
    }
  });

  for (const entry of entries) {
    const data = { pregunta: entry.pregunta, respuesta: entry.respuesta };
    if (entry.id) {
      await tx.preguntaFrecuente.update({ where: { id: entry.id }, data });
    } else {
      await tx.preguntaFrecuente.create({ data: { ...data, productoId: productId } });
    }
  }
}
