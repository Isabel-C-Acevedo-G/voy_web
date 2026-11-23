import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Espacio, EstadoEspacio } from '../models/espacio.model';

@Injectable({ providedIn: 'root' })
export class EspacioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/espacios`;

  list(filters?: { estado?: EstadoEspacio; activo?: boolean }): Observable<Espacio[]> {
    let params = new HttpParams();
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters?.activo != null) {
      params = params.set('activo', filters.activo);
    }
    return this.http.get<Espacio[]>(this.baseUrl, { params });
  }
}
