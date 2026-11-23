/** Espejo de app/schemas/rol_schema.py */

export interface Rol {
  idRol: number;
  nombre: string;
  creadoEn: string;
}

export interface RolCreate {
  nombre: string;
}
