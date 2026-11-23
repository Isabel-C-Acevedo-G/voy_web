import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Salida, SalidaCreate } from '../models/salida.model';

@Injectable({ providedIn: 'root' })
export class SalidaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/salidas`;

  list(): Observable<Salida[]> {
    return this.http.get<Salida[]>(this.baseUrl);
  }

  create(data: SalidaCreate & { idVigilante: number }): Observable<Salida> {
    return this.http.post<Salida>(this.baseUrl, data);
  }
}
