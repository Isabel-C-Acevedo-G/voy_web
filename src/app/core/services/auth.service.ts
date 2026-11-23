import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RegisterRequest, TokenResponse, VoyRol } from '../models/auth.model';
import { Usuario } from '../models/usuario.model';
import { AlertService } from './alert.service';

const TOKEN_KEY = 'voy_token';
const ROL_KEY = 'voy_rol';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly baseUrl = environment.apiUrl;

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly rolSignal = signal<VoyRol | string | null>(localStorage.getItem(ROL_KEY));
  private readonly userSignal = signal<Usuario | null>(null);
  private readonly flashSignal = signal<string | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly rol = this.rolSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly flash = this.flashSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  register(data: RegisterRequest): Observable<Usuario> {
    // Registro público: no enviar idRol (API asigna ciclista)
    const { idRol: _omit, ...payload } = data;
    return this.http.post<Usuario>(`${this.baseUrl}/auth/register`, {
      ...payload,
      aceptaTratamientoDatos: true,
    });
  }

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new HttpParams().set('username', username).set('password', password);
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/auth/login`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((res) => {
          this.persistSession(res.access_token, res.rol);
        }),
      );
  }

  me(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/auth/me`).pipe(
      tap((user) => this.userSignal.set(user)),
    );
  }

  /** Restaura perfil si hay token (tras recarga). */
  restoreSession(): void {
    if (!this.tokenSignal()) {
      return;
    }
    this.me().subscribe({
      error: () => this.clearSession(),
    });
  }

  logout(message?: string): void {
    this.clearSession();
    if (message) {
      this.flashSignal.set(message);
      this.alerts.warning(message);
    }
    void this.router.navigate(['/login']);
  }

  clearFlash(): void {
    this.flashSignal.set(null);
  }

  setFlash(message: string): void {
    this.flashSignal.set(message);
  }

  homeForRole(rol: string | null | undefined): string {
    switch (rol) {
      case 'vigilante':
        return '/ingresos';
      case 'administrador':
        return '/usuarios';
      case 'ciclista':
      default:
        return '/bicicletas';
    }
  }

  private persistSession(token: string, rol: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROL_KEY, rol);
    this.tokenSignal.set(token);
    this.rolSignal.set(rol);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_KEY);
    this.tokenSignal.set(null);
    this.rolSignal.set(null);
    this.userSignal.set(null);
  }
}
