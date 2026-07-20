import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = path.resolve('public/uploads/gastos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('El comprobante del gasto debe ser imagen o PDF.'));
};

export const uploadGasto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 }
});

export function handleExpenseUploadError(err, req, res, next) {
  if (!err) return next();
  const limit = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
  req.session.financeFlash = {
    type: 'error',
    text: limit ? 'El comprobante del gasto excede 6MB.' : err.message
  };
  res.redirect('/admin/finanzas');
}
