/** Espejo de app/schemas/usuario_schema.py */

export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PA';
export type EstadoUsuario = 'activo' | 'inactivo';

export interface Usuario {
  idUsuario: number;
  nombre: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  correo: string;
  telefono: string | null;
  idRol: number;
  estado: EstadoUsuario;
  aceptaTratamientoDatos: boolean;
  creadoEn: string;
  actualizadoEn: string | null;
  creadoPor: number | null;
}

export interface UsuarioUpdate {
  nombre?: string;
  telefono?: string | null;
  idRol?: number;
  estado?: EstadoUsuario;
}
