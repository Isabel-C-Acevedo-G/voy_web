import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstadoReserva, Reserva } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  list(filters?: { estado?: EstadoReserva; idUsuario?: number }): Observable<Reserva[]> {
    let params = new HttpParams();
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    if (filters?.idUsuario != null) {
      params = params.set('idUsuario', filters.idUsuario);
    }
    return this.http.get<Reserva[]>(this.baseUrl, { params });
  }

  create(idEspacio: number, idUsuario: number): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, { idEspacio, idUsuario });
  }

  cancelar(idReserva: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${idReserva}/cancelar`, {});
  }
}
