// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

/**
 * ============================================================================
 * SERVICIO DE AUTENTICACIÓN DEL ADMINISTRADOR
 * ============================================================================
 * 
 * Encapsula la lógica de negocio para la gestión de usuarios administradores.
 * Los controladores no interactúan directamente con bcrypt ni con prisma, 
 * todo pasa a través de estos métodos estáticos de servicio para mantener
 * el principio de Responsabilidad Única.
 */

export class AuthService {
  /**
   * Intenta autenticar a un administrador usando su correo y contraseña.
   * Valida la existencia del usuario y compara el hash seguro.
   * 
   * @param {string} correo - Correo electrónico del admin.
   * @param {string} password - Contraseña en texto plano.
   * @returns {Promise<Object|null>} Retorna el objeto del admin sin el passwordHash, o null si falla.
   */
  static async loginAdmin(correo, password) {
    if (!correo || !password) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    try {
      // 1. Buscamos al administrador en la base de datos de manera segura
      // Se utiliza findUnique para aprovechar los índices en columnas únicas.
      const admin = await prisma.usuarioAdmin.findUnique({
        where: { correo: correo.trim().toLowerCase() }
      });

      // 2. Si el usuario no existe, retornamos null
      // Prevención de user enumeration: siempre retornar el mismo tipo de respuesta genérica
      if (!admin) {
        return null;
      }

      // 3. Verificamos la contraseña contra el hash almacenado
      // bcryptjs maneja de forma segura las comparaciones para evitar timing attacks
      const esValido = await bcrypt.compare(password, admin.passwordHash);

      if (!esValido) {
        return null;
      }

      // 4. Si es exitoso, retornamos el usuario sin exponer datos sensibles (password)
      const { passwordHash, ...adminSeguro } = admin;
      return adminSeguro;

    } catch (error) {
      console.error('❌ Error en AuthService.loginAdmin:', error.message);
      // Arrojamos un error genérico para no filtrar detalles técnicos a las capas superiores
      throw new Error('Error interno durante el proceso de autenticación.');
    }
  }

  /**
   * Registra un administrador inicial en el sistema si no existe ninguno.
   * Útil para el seeding o el primer setup de la plataforma.
   * 
   * @param {string} correo - Correo del nuevo administrador
   * @param {string} passwordPlano - Contraseña segura en texto plano
   * @returns {Promise<Object>} Retorna el admin creado
   */
  static async crearAdminInicial(correo, passwordPlano) {
    // 1. Verificamos si ya existe al menos un admin
    const conteo = await prisma.usuarioAdmin.count();
    if (conteo > 0) {
      throw new Error('Ya existe un administrador en el sistema. Proceso abortado.');
    }

    try {
      // 2. Generamos el hash de la contraseña usando bcryptjs
      // El coste (saltRounds) 12 es un buen balance entre seguridad y rendimiento actual
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(passwordPlano, salt);

      // 3. Guardamos el nuevo registro
      const nuevoAdmin = await prisma.usuarioAdmin.create({
        data: {
          correo: correo.trim().toLowerCase(),
          passwordHash: hash
        }
      });

      console.log(`✅ Administrador inicial creado con éxito: ${nuevoAdmin.correo}`);
      
      // Eliminamos la propiedad de hash antes de retornar
      const { passwordHash, ...adminSeguro } = nuevoAdmin;
      return adminSeguro;

    } catch (error) {
      console.error('❌ Error en AuthService.crearAdminInicial:', error.message);
      throw new Error('No se pudo crear el administrador inicial debido a un fallo en la base de datos.');
    }
  }

  /**
   * Cierra sesión destruyendo el objeto de sesión de Express.
   * Devuelve una promesa que se resuelve al completar la destrucción.
   * @param {import('express').Request} req 
   */
  static async logoutAdmin(req) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Error destruyendo la sesión:', err);
          return reject(new Error('No se pudo cerrar la sesión correctamente.'));
        }
        resolve(true);
      });
    });
  }
}
// Líneas: 114
