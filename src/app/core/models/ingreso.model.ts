/** Espejo de app/schemas/ingreso_schema.py */

export type EstadoIngreso = 'activo' | 'cerrado';

export interface Ingreso {
  idIngreso: number;
  idBicicleta: number;
  idEspacio: number;
  idReserva: number | null;
  fechaIngreso: string;
  idVigilante: number;
  observaciones: string | null;
  estado: EstadoIngreso;
  creadoEn: string;
}

export interface IngresoCreate {
  idBicicleta: number;
  idReserva?: number | null;
  observaciones?: string | null;
}
