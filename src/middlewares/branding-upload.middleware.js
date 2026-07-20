import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const uploadDir = path.resolve('public/uploads/branding');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(10).toString('hex');
    cb(null, `${Date.now()}-${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Formato no permitido. Usa JPG, PNG o WEBP.'));
};

export const uploadBrandingImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const handleBrandingUploadError = (err, req, res, next) => {
  if (!err) return next();
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'La imagen excede el limite de 5MB.'
    : err.message;
  return res.redirect(`/admin/apariencia?error=${encodeURIComponent(message)}`);
};
