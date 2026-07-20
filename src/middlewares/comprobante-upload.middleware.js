import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const uploadDir = path.resolve('public/uploads/comprobantes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (permitidos.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('El comprobante debe ser imagen o PDF.'));
};

export const uploadComprobante = multer({
  storage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 }
});

export const handleComprobanteError = (err, req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).send('El comprobante excede el limite de 6MB.');
  }
  return res.status(400).send(err.message || 'No se pudo subir el comprobante.');
};
