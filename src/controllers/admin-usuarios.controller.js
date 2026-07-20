import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { AdminClientService } from '../services/admin-client.service.js';

const clean = (value) => String(value || '').trim();

async function hashPassword(password) {
  const limpio = clean(password);
  if (limpio.length < 6) throw new Error('La contrasena debe tener al menos 6 caracteres.');
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(limpio, salt);
}

function flash(req, type, message) {
  req.session.usuariosFlash = { type, message };
}

export class AdminUsuariosController {
  static async listar(req, res) {
    try {
      const [clientes, administradores] = await Promise.all([
        prisma.cliente.findMany({ orderBy: { creadoEn: 'desc' } }),
        prisma.usuarioAdmin.findMany({ orderBy: { creadoEn: 'desc' } })
      ]);
      const flashMsg = req.session.usuariosFlash || null;
      delete req.session.usuariosFlash;
      res.render('admin/usuarios', {
        admin: res.locals.admin,
        clientes,
        administradores,
        flashMsg
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar usuarios.');
    }
  }

  static async crearCliente(req, res) {
    try {
      const { correo, password, nombre, apellidos, cedula, celular1, celular2 } = req.body;
      await prisma.cliente.create({
        data: {
          correo: clean(correo).toLowerCase(),
          passwordHash: await hashPassword(password),
          nombre: clean(nombre),
          apellidos: clean(apellidos),
          cedula: clean(cedula),
          celular1: clean(celular1),
          celular2: clean(celular2) || null,
          cuentaVerificada: req.body.cuentaVerificada === 'on'
        }
      });
      flash(req, 'ok', 'Cliente creado correctamente.');
    } catch (error) {
      console.error(error);
      flash(req, 'error', error.message || 'No se pudo crear el cliente.');
    }
    res.redirect('/admin/usuarios');
  }

  static async crearAdmin(req, res) {
    try {
      const correo = clean(req.body.correo).toLowerCase();
      await prisma.usuarioAdmin.create({
        data: { correo, passwordHash: await hashPassword(req.body.password) }
      });
      flash(req, 'ok', 'Administrador creado correctamente.');
    } catch (error) {
      console.error(error);
      flash(req, 'error', error.message || 'No se pudo crear el administrador.');
    }
    res.redirect('/admin/usuarios');
  }

  static async eliminarAdmin(req, res) {
    try {
      const adminId = Number.parseInt(req.params.id, 10);
      if (adminId === res.locals.admin.id) {
        throw new Error('No puedes eliminar tu propio administrador activo.');
      }

      const totalAdmins = await prisma.usuarioAdmin.count();
      if (totalAdmins <= 1) throw new Error('Debe quedar al menos un administrador.');

      await prisma.usuarioAdmin.delete({ where: { id: adminId } });
      flash(req, 'ok', 'Administrador eliminado correctamente.');
    } catch (error) {
      console.error(error);
      flash(req, 'error', error.message || 'No se pudo eliminar el administrador.');
    }
    res.redirect('/admin/usuarios');
  }

  static async eliminarCliente(req, res) {
    try {
      const clienteId = Number.parseInt(req.params.id, 10);
      await AdminClientService.eliminarCliente(clienteId);
      flash(req, 'ok', 'Cliente eliminado correctamente.');
    } catch (error) {
      console.error(error);
      flash(req, 'error', error.message || 'No se pudo eliminar el cliente.');
    }
    res.redirect('/admin/usuarios');
  }
}
