/** Espejo de app/schemas/nota_schema.py */

export type TipoMovimiento = 'ingreso' | 'salida';

export interface Nota {
  idNota: number;
  tipoMovimiento: TipoMovimiento;
  idMovimiento: number;
  texto: string;
  idAdministrador: number;
  fecha: string;
}

export interface NotaCreate {
  tipoMovimiento: TipoMovimiento;
  idMovimiento: number;
  texto: string;
}
