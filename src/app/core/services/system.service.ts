import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiRoot } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** GET / — respuesta completa para intentar leer cabeceras X-* */
  getRoot(): Observable<HttpResponse<ApiRoot>> {
    return this.http.get<ApiRoot>(`${this.baseUrl}/`, { observe: 'response' });
  }
}
