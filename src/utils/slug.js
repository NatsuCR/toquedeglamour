export function toSlug(value) {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug || 'item';
}

export async function uniqueSlug(delegate, value, excludeId = null) {
  const base = toSlug(value);
  let slug = base;
  let count = 2;

  while (true) {
    const found = await delegate.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${count}`;
    count += 1;
  }
}
