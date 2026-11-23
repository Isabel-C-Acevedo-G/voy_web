/** Espejo de app/schemas/espacio_schema.py */

export type EstadoEspacio = 'libre' | 'ocupado' | 'reservado';

export interface Espacio {
  idEspacio: number;
  codigo: string;
  estado: EstadoEspacio;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface EspacioCreate {
  codigo: string;
  activo?: boolean;
}

export interface EspacioUpdate {
  codigo?: string;
  activo?: boolean;
}
