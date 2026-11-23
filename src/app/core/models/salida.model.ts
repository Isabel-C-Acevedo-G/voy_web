/** Espejo de app/schemas/salida_schema.py */

export interface Salida {
  idSalida: number;
  idIngreso: number;
  fechaSalida: string;
  idVigilante: number;
  verificacionMarca: boolean;
  verificacionColor: boolean;
  verificacionSerie: boolean;
  duracionMinutos: number | null;
  nota: string | null;
  creadoEn: string;
}

export interface SalidaCreate {
  idIngreso: number;
  verificacionMarca: boolean;
  verificacionColor: boolean;
  verificacionSerie: boolean;
  nota?: string | null;
}
