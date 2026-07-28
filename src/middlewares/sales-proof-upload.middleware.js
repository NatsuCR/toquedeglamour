import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = path.resolve('public/uploads/ventas');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('El comprobante de la venta debe ser imagen o PDF.'));
};

export const uploadSaleProofs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024, files: 4 }
});

export function deleteSaleProofs(files = []) {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
  });
}

export function handleSaleProofError(err, req, res, next) {
  if (!err) return next();
  const limit = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
  req.session.salesFlash = {
    type: 'error',
    message: limit ? 'El comprobante de venta excede 6MB.' : err.message
  };
  res.redirect('/admin/ventas');
}
