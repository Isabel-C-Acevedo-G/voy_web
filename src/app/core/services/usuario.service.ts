import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstadoUsuario, Usuario, UsuarioUpdate } from '../models/usuario.model';

export interface UsuarioGestion {
  nuevoEstado?: EstadoUsuario | null;
  nuevoRol?: number | null;
  motivo: string;
  idAdministrador: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  list(filters?: { estado?: EstadoUsuario; idRol?: number }): Observable<Usuario[]> {
    let params = new HttpParams();
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters?.idRol != null) {
      params = params.set('idRol', filters.idRol);
    }
    return this.http.get<Usuario[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  update(id: number, data: UsuarioUpdate): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}`, data);
  }

  gestion(id: number, data: UsuarioGestion): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/gestion`, data);
  }
}
