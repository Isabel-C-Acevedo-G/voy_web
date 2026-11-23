import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  EstadoIncidente,
  Incidente,
  IncidenteCreate,
  IncidenteUpdate,
  TipoIncidente,
} from '../models/incidente.model';

@Injectable({ providedIn: 'root' })
export class IncidenteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/incidentes`;

  list(filters?: { estado?: EstadoIncidente; tipo?: TipoIncidente }): Observable<Incidente[]> {
    let params = new HttpParams();
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters?.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    return this.http.get<Incidente[]>(this.baseUrl, { params });
  }

  create(data: IncidenteCreate & { idResponsable: number }): Observable<Incidente> {
    return this.http.post<Incidente>(this.baseUrl, data);
  }

  update(id: number, data: IncidenteUpdate): Observable<Incidente> {
    return this.http.patch<Incidente>(`${this.baseUrl}/${id}`, data);
  }
}
