/** Espejo de app/schemas/incidente_schema.py */

export type TipoIncidente = 'daño' | 'pérdida' | 'intento de robo' | 'conducta' | 'otro';
export type EstadoIncidente = 'abierto' | 'cerrado';

export interface Incidente {
  idIncidente: number;
  tipo: TipoIncidente;
  descripcion: string;
  fecha: string;
  idBicicleta: number | null;
  idUsuarioInvolucrado: number | null;
  foto: string | null;
  idResponsable: number;
  estado: EstadoIncidente;
  creadoEn: string;
}

export interface IncidenteCreate {
  tipo: TipoIncidente;
  descripcion: string;
  idBicicleta?: number | null;
  idUsuarioInvolucrado?: number | null;
  foto?: string | null;
}

export interface IncidenteUpdate {
  descripcion?: string;
  estado?: EstadoIncidente;
  foto?: string | null;
}
