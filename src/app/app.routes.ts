import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

const soon = (title: string, roles?: string[]) => ({
  loadComponent: () =>
    import('./shared/coming-soon/coming-soon').then((m) => m.ComingSoon),
  data: roles?.length ? { title, roles } : { title },
  canActivate: roles?.length ? [authGuard, roleGuard] : [authGuard],
});

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login · VOY',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Registro · VOY',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    title: 'Inicio · VOY',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'bicicletas',
    title: 'Bicicletas · VOY',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bicicletas/bicicletas').then((m) => m.Bicicletas),
  },
  {
    path: 'reservas',
    title: 'Reservas · VOY',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ciclista', 'administrador'] },
    loadComponent: () => import('./features/reservas/reservas').then((m) => m.Reservas),
  },
  {
    path: 'perfil',
    title: 'Perfil · VOY',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil),
  },
  { path: 'espacios', title: 'Espacios · VOY', ...soon('Espacios') },
  {
    path: 'ingresos',
    title: 'Ingresos · VOY',
    ...soon('Ingresos', ['administrador', 'vigilante']),
  },
  {
    path: 'salidas',
    title: 'Salidas · VOY',
    ...soon('Salidas', ['administrador', 'vigilante']),
  },
  {
    path: 'incidentes',
    title: 'Incidentes · VOY',
    ...soon('Incidentes', ['administrador', 'vigilante']),
  },
  {
    path: 'notas',
    title: 'Notas · VOY',
    ...soon('Notas', ['administrador', 'vigilante']),
  },
  {
    path: 'usuarios',
    title: 'Usuarios · VOY',
    ...soon('Usuarios', ['administrador']),
  },
  {
    path: 'reportes',
    title: 'Reportes · VOY',
    ...soon('Reportes', ['administrador']),
  },
  {
    path: 'forbidden',
    title: 'Sin permiso · VOY',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    path: '**',
    title: 'No encontrado · VOY',
    loadComponent: () => import('./shared/not-found/not-found').then((m) => m.NotFound),
  },
];
