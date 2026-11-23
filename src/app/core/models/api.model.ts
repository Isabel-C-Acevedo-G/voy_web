/** Formatos de respuesta generales de voy_api */

export interface ApiRoot {
  message: string;
}

/** Errores JSON típicos de FastAPI */
export interface ApiErrorDetail {
  detail?: string | ValidationErrorItem[];
}

export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}
