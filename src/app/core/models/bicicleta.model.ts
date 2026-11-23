/** Espejo de app/schemas/bicicleta_schema.py */

export type TipoBicicleta = 'urbana' | 'montaña' | 'ruta' | 'eléctrica' | 'otra';
export type EstadoBicicleta = 'activa' | 'inactiva';

export interface Bicicleta {
  idBicicleta: number;
  idPropietario: number;
  marca: string;
  modelo: string;
  color: string;
  tipo: TipoBicicleta | null;
  numeroSerie: string;
  foto: string | null;
  estado: EstadoBicicleta;
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface BicicletaCreate {
  marca: string;
  modelo: string;
  color: string;
  tipo?: TipoBicicleta | null;
  numeroSerie: string;
  foto?: string | null;
}

export interface BicicletaUpdate {
  marca?: string;
  modelo?: string;
  color?: string;
  tipo?: TipoBicicleta | null;
  foto?: string | null;
}
