import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Nota, NotaCreate, TipoMovimiento } from '../models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notas`;

  list(filters?: {
    tipoMovimiento?: TipoMovimiento;
    idMovimiento?: number;
  }): Observable<Nota[]> {
    let params = new HttpParams();
    if (filters?.tipoMovimiento) {
      params = params.set('tipoMovimiento', filters.tipoMovimiento);
    }
    if (filters?.idMovimiento != null) {
      params = params.set('idMovimiento', filters.idMovimiento);
    }
    return this.http.get<Nota[]>(this.baseUrl, { params });
  }

  create(data: NotaCreate & { idAdministrador: number }): Observable<Nota> {
    return this.http.post<Nota>(this.baseUrl, data);
  }
}
