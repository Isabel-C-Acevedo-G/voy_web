/** Espejo de app/schemas/reporte_schema.py */

export type TipoReporte = 'ocupacion' | 'movimientos' | 'usuarios_frecuentes';
export type FormatoReporte = 'json' | 'csv';

export interface ReporteQuery {
  tipo: TipoReporte;
  fechaDesde: string;
  fechaHasta: string;
  formato?: FormatoReporte;
}
