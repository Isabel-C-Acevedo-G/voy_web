/** Espejo de app/schemas/auth_schema.py */
import type { TipoDocumento } from './usuario.model';

export type VoyRol = 'ciclista' | 'vigilante' | 'administrador';

export interface RegisterRequest {
  nombre: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  correo: string;
  telefono?: string | null;
  clave: string;
  idRol?: number | null;
  aceptaTratamientoDatos: boolean;
}

/** Credenciales: se envían como form OAuth2 (username = correo o documento) */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer' | string;
  rol: VoyRol | string;
  expiraEn: string;
}
