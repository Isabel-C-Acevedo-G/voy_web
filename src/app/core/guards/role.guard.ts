import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { VoyRol } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data['roles'] as VoyRol[] | undefined) ?? [];
  const rol = auth.rol();

  if (!allowed.length || (rol && allowed.includes(rol as VoyRol))) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
