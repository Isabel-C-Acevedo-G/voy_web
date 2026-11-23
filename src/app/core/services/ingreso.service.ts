import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstadoIngreso, Ingreso } from '../models/ingreso.model';
import { Salida, SalidaCreate } from '../models/salida.model';

@Injectable({ providedIn: 'root' })
export class IngresoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ingresos`;

  list(filters?: {
    estado?: EstadoIngreso;
    idBicicleta?: number;
    idVigilante?: number;
  }): Observable<Ingreso[]> {
    let params = new HttpParams();
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters?.idBicicleta != null) {
      params = params.set('idBicicleta', filters.idBicicleta);
    }
    if (filters?.idVigilante != null) {
      params = params.set('idVigilante', filters.idVigilante);
    }
    return this.http.get<Ingreso[]>(this.baseUrl, { params });
  }

  create(payload: {
    idBicicleta: number;
    idVigilante: number;
    idReserva?: number | null;
    observaciones?: string | null;
  }): Observable<Ingreso> {
    return this.http.post<Ingreso>(this.baseUrl, payload);
  }

  /** Alias PATCH /ingresos/{id}/salida */
  registrarSalida(
    idIngreso: number,
    data: Omit<SalidaCreate, 'idIngreso'> & { idVigilante: number },
  ): Observable<Salida> {
    return this.http.patch<Salida>(`${this.baseUrl}/${idIngreso}/salida`, {
      idIngreso,
      ...data,
    });
  }
}
