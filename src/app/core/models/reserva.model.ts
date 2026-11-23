/** Espejo de app/schemas/reserva_schema.py */

export type EstadoReserva = 'activa' | 'usada' | 'cancelada' | 'vencida';

export interface Reserva {
  idReserva: number;
  idUsuario: number;
  idEspacio: number;
  fechaReserva: string;
  fechaExpiracion: string;
  estado: EstadoReserva;
  creadoEn: string;
}

export interface ReservaCreate {
  idEspacio: number;
}
