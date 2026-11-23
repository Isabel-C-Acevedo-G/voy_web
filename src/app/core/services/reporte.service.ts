import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TipoReporte } from '../models/reporte.model';

export interface ReporteOcupacion {
  tipo: 'ocupacion';
  fechaDesde: string;
  fechaHasta: string;
  totalEspaciosActivos: number;
  porEstado: Record<string, number>;
}

export interface ReporteMovimientos {
  tipo: 'movimientos';
  fechaDesde: string;
  fechaHasta: string;
  totalIngresos: number;
  totalSalidas: number;
}

export interface ReporteUsuariosFrecuentes {
  tipo: 'usuarios_frecuentes';
  fechaDesde: string;
  fechaHasta: string;
  usuarios: Array<{
    idUsuario: number;
    nombre: string;
    correo: string;
    ingresos: number;
  }>;
}

export type ReporteJson = ReporteOcupacion | ReporteMovimientos | ReporteUsuariosFrecuentes;

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  getJson(
    tipo: TipoReporte,
    fechaDesde: string,
    fechaHasta: string,
  ): Observable<ReporteJson> {
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta)
      .set('formato', 'json');
    return this.http.get<ReporteJson>(this.baseUrl, { params });
  }

  getCsv(
    tipo: TipoReporte,
    fechaDesde: string,
    fechaHasta: string,
  ): Observable<HttpResponse<string>> {
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta)
      .set('formato', 'csv');
    return this.http.get(this.baseUrl, {
      params,
      responseType: 'text',
      observe: 'response',
    });
  }
}
