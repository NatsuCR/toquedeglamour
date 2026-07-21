import fs from 'fs';

export function borrarUploads(files) {
  const archivos = Array.isArray(files) ? files.filter(Boolean) : [];
  archivos.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
  });
}
