import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

function detailMessage(err: HttpErrorResponse): string {
  const detail = err.error?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item: { msg?: string }) => item.msg ?? '').filter(Boolean).join(' · ');
  }
  return err.message || 'Error de red';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      const message = detailMessage(err);

      if (err.status === 401) {
        auth.logout('Sesión expirada o no autenticado');
        return throwError(() => err);
      }

      if (err.status === 403) {
        if (message.toLowerCase().includes('inactivo')) {
          auth.logout('Usuario inactivo');
        } else {
          auth.setFlash(message || 'No tienes permiso para esta operación');
          void router.navigate(['/forbidden']);
        }
        return throwError(() => err);
      }

      return throwError(() => err);
    }),
  );
};
