import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio · VOY',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '**',
    title: 'No encontrado · VOY',
    loadComponent: () => import('./shared/not-found/not-found').then((m) => m.NotFound),
  },
];
