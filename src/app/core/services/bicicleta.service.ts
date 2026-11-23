import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Bicicleta,
  BicicletaCreate,
  BicicletaUpdate,
  EstadoBicicleta,
} from '../models/bicicleta.model';

@Injectable({ providedIn: 'root' })
export class BicicletaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bicicletas`;

  list(filters?: {
    idPropietario?: number;
    estado?: EstadoBicicleta;
    numeroSerie?: string;
  }): Observable<Bicicleta[]> {
    let params = new HttpParams();
    if (filters?.idPropietario != null) {
      params = params.set('idPropietario', filters.idPropietario);
    }
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters?.numeroSerie) {
      params = params.set('numeroSerie', filters.numeroSerie);
    }
    return this.http.get<Bicicleta[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<Bicicleta> {
    return this.http.get<Bicicleta>(`${this.baseUrl}/${id}`);
  }

  create(data: BicicletaCreate & { idPropietario: number }): Observable<Bicicleta> {
    return this.http.post<Bicicleta>(this.baseUrl, data);
  }

  update(id: number, data: BicicletaUpdate): Observable<Bicicleta> {
    return this.http.patch<Bicicleta>(`${this.baseUrl}/${id}`, data);
  }
}
