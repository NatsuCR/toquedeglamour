// src/server.js
import app from './app.js';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

/**
 * Carga de variables de entorno desde el archivo .env
 * Asegura que todas las variables definidas estén disponibles en process.env
 */
dotenv.config();

/**
 * Instancia global de Prisma Client para verificar la conexión inicial
 * de la base de datos antes de levantar el servidor Express.
 * @type {PrismaClient}
 */
const prisma = new PrismaClient();

/**
 * Puerto en el cual el servidor Node.js escuchará las peticiones HTTP.
 * Se puede sobrescribir con la variable de entorno PORT.
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Función principal para iniciar el servidor de manera segura.
 * Realiza comprobaciones previas como la conexión a la base de datos
 * para asegurar que la aplicación no inicie en un estado inconsistente.
 * 
 * @async
 * @function iniciarServidor
 * @returns {Promise<void>} No retorna ningún valor, inicializa el listener
 */
async function iniciarServidor() {
  try {
    // Verificar conexión a la base de datos (MariaDB vía Prisma)
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos MariaDB establecida exitosamente.');

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor de Toque de Glamour corriendo en http://localhost:${PORT}`);
      console.log(`🔧 Entorno de ejecución: ${process.env.NODE_ENV || 'development'}`);
    });

    /**
     * Configuración de Graceful Shutdown (Apagado Seguro).
     * Permite cerrar conexiones activas (Base de datos, Server) antes de
     * matar el proceso de Node.js, evitando pérdida de datos o request truncados.
     */
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️ Recibida señal ${signal}. Iniciando apagado seguro...`);
      
      server.close(async () => {
        console.log('🛑 Servidor HTTP cerrado. No se aceptan nuevas peticiones.');
        try {
          await prisma.$disconnect();
          console.log('🔌 Conexión a la base de datos cerrada.');
          process.exit(0);
        } catch (dbError) {
          console.error('❌ Error al desconectar la base de datos:', dbError);
          process.exit(1);
        }
      });

      // Si el servidor tarda más de 10 segundos en cerrar, forzar el apagado
      setTimeout(() => {
        console.error('⏰ Tiempo de espera agotado. Forzando cierre del proceso.');
        process.exit(1);
      }, 10000);
    };

    // Manejadores de señales del sistema operativo para PM2 / Docker / Terminal
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

/**
 * Captura y registro de excepciones no manejadas (Uncaught Exceptions).
 * Previene que el servidor crashee silenciosamente sin dejar rastros en los logs.
 */
process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada (uncaughtException):', error);
  // Un uncaughtException deja el sistema en un estado inestable,
  // es buena práctica registrar el error y salir.
  process.exit(1);
});

/**
 * Captura y registro de promesas rechazadas no manejadas (Unhandled Rejections).
 * Útil para detectar fallos asíncronos que olvidaron su respectivo try/catch.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada (unhandledRejection):', reason);
  // Al igual que con uncaughtException, la acción recomendada es reiniciar el proceso.
  // PM2 se encargará de levantarlo nuevamente de forma limpia.
  process.exit(1);
});

// Ejecución del punto de entrada principal
iniciarServidor();
// Líneas: 108
