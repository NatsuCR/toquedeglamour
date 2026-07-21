import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/admin.routes.js';
import clientRoutes from './routes/client.routes.js';
import aparienciaRoutes from './routes/apariencia.routes.js';
import { injectSiteSettings } from './middlewares/site-settings.middleware.js';
import { formatMoneyCRC } from './utils/money.js';
import { formatWeight } from './services/shipping.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.formatMoney = formatMoneyCRC;
app.locals.formatWeight = formatWeight;

app.use(helmet({
  contentSecurityPolicy: false,
  xPoweredBy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(methodOverride('_method'));

app.use(session({
  name: 'toquedeglamour_sid',
  secret: process.env.SESSION_SECRET || 'llave_super_secreta_toquedeglamour',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax'
  }
}));

app.use(express.static(path.join(__dirname, '../public')));
app.use(injectSiteSettings);

app.use('/admin/apariencia', aparienciaRoutes);
app.use('/admin', adminRoutes);
app.use('/', clientRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servidor de Toque de Glamour operativo.'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada (404)' });
});

app.use((err, req, res, next) => {
  console.error('[Error App]:', err.message);
  res.status(err.statusCode || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salio mal.'
  });
});

export default app;
