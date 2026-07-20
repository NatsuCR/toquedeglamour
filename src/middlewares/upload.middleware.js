// src/middlewares/upload.middleware.js
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

/**
 * ============================================================================
 * MIDDLEWARE DE SUBIDA DE IMÁGENES (MULTER)
 * ============================================================================
 * Gestiona de forma segura el almacenamiento local de imágenes de productos.
 * Asegura nombres únicos, restringe tipos de archivos y establece límites de peso.
 */

// Directorio destino absoluto (creándolo si no existe)
const uploadDir = path.resolve('public/uploads/productos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Motor de almacenamiento en disco.
 * Genera nombres pseudo-aleatorios (hash hex) para evitar colisiones 
 * y sanitizar el input del usuario original.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Extraemos la extensión original de forma segura
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Generamos un hash único usando el timestamp y bytes aleatorios
    const hash = crypto.randomBytes(16).toString('hex');
    const uniqueName = `${Date.now()}-${hash}${ext}`;
    
    cb(null, uniqueName);
  }
});

/**
 * Filtro estricto de seguridad para rechazar cualquier archivo
 * que no sea una imagen web estándar.
 */
const fileFilter = (req, file, cb) => {
  const mimetypesPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (mimetypesPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Rechazamos el archivo silenciosamente o devolvemos un error
    cb(new Error('Formato de imagen no permitido. Usa JPG, PNG o WEBP.'));
  }
};

/**
 * Middleware exportable de Multer configurado.
 * Límite de tamaño establecido en 5MB (5 * 1024 * 1024 bytes) por imagen.
 */
export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB máximo
  }
});

/**
 * Wrapper opcional para manejar errores de multer gracefully en Express,
 * sin que bloquee el hilo principal con una traza cruda.
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'La imagen excede el límite de 5MB.' });
    }
    return res.status(400).json({ error: `Error de carga: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
// Líneas: 74
